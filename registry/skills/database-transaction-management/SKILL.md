---
name: database-transaction-management
description: Quy chuẩn quản lý Giao dịch cơ sở dữ liệu (@Transactional) trong Spring Boot: Chiến lược Lan truyền (Propagation), Cô lập (Isolation), Phòng thủ Self-Invocation, Tối ưu Read-Only và Nguyên tắc cấm chiếm giữ DB Connection Pool khi gọi API ngoài.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM .shared/skills/02-codestyle/database-transaction-management/SKILL.md — DO NOT EDIT DIRECTLY -->

# Quy Chuẩn Quản Lý Giao Dịch Cơ Sở Dữ Liệu (Enterprise Database Transaction Management)

Tài liệu này chuẩn hóa toàn diện các nguyên tắc thiết kế, cấu hình và gỡ lỗi liên quan đến Giao dịch cơ sở dữ liệu (`@Transactional`) trong các hệ thống Backend Microservices (Spring Boot 3, Spring Data JPA/Hibernate, MySQL/PostgreSQL/Oracle, Java/Groovy).

---

## 1. 5 Trụ Cột Quản Lý `@Transactional` Chuẩn Enterprise

```groovy
@Transactional(
    readOnly = false,                       // 1. Phân định rõ Read-Only vs Read-Write
    propagation = Propagation.REQUIRED,     // 2. Chiến lược lan truyền (Mặc định: REQUIRED)
    isolation = Isolation.READ_COMMITTED,   // 3. Mức độ cô lập (Tránh Dirty Read)
    timeout = 5,                            // 4. Timeout tối đa (giây) cho transaction DB
    rollbackFor = [Exception.class]         // 5. BẮT BUỘC: Rollback cho toàn bộ Exception
)
```

> [!IMPORTANT]
> **Quy Tắc Bắt Buộc: `rollbackFor = [Exception.class]`**  
> Mặc định trong Spring Framework, `@Transactional` chỉ tự động rollback khi phát sinh **Unchecked Exception** (`RuntimeException` hoặc `Error`). Nếu gặp Checked Exception (`IOException`, `SQLException`, `Exception`), Spring sẽ **vẫn commit dữ liệu**.  
> Do đó, **100% annotation `@Transactional` trong dự án bắt buộc phải khai báo `rollbackFor = [Exception.class]`**.

---

## 2. Chiến Lược Lan Truyền (Transaction Propagation Strategies)

| Mức Lan Truyền | Hành Vi Nghiệp Vụ | Khi Nào Sử Dụng Trong Dự Án? |
| :--- | :--- | :--- |
| **`REQUIRED`** *(Mặc định)* | Sử dụng transaction hiện có; nếu chưa có thì tạo transaction mới. | Toàn bộ các luồng nghiệp vụ ghi dữ liệu thông thường (Tạo Account, Cập nhật trạng thái). |
| **`REQUIRES_NEW`** | Luôn tạm dừng transaction hiện tại và **tạo 1 transaction hoàn toàn độc lập**. | **Audit Log / Nhật ký lỗi:** Ghi log lỗi vào bảng `tbl_register_log` ngay cả khi nghiệp vụ chính bị rollback. |
| **`SUPPORTS`** | Chạy trong transaction nếu có; nếu không có thì chạy non-transactional. | Các hàm tiện ích đọc dữ liệu phụ trợ. |
| **`NOT_SUPPORTED`** | Tạm dừng transaction hiện có để thực thi non-transactional. | Thực thi các tác vụ nặng về I/O hoặc gọi mạng bên ngoài. |

### Ví dụ Vận Dụng `REQUIRES_NEW` Cho Ghi Log Lỗi Độc Lập:
```groovy
@Service
class AuditLogService {

    @Autowired
    RegisterLogRepository registerLogRepository

    // Luôn commit log vào DB ngay cả khi luồng nghiệp vụ chính bị rollback thất bại
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = [Exception.class])
    void logErrorRecord(String requestId, String step, String errorCode, String errorMessage) {
        RegisterLog log = new RegisterLog(
            requestId: requestId,
            step: step,
            errorCode: errorCode,
            errorMessage: errorMessage,
            createdDate: new Date()
        )
        registerLogRepository.save(log)
    }
}
```

---

## 3. Tối Ưu Hóa Truy Vấn Bằng `readOnly = true`

Đối với các phương thức chỉ đọc dữ liệu (Query / Fetch / List):
```groovy
@Transactional(readOnly = true)
AccountStatusResp getAccountStatus(String idCode, String partnerCode, String requestId) {
    // ...
}
```

### Lợi Ích Kỹ Thuật:
1. **Bỏ qua Dirty Checking:** Hibernate không cần lưu Snapshot của Entity trong Memory để so sánh thay đổi khi kết thúc transaction -> Giảm tải RAM và CPU.
2. **Tối ưu Flush Mode:** Chuyển sang `FlushMode.MANUAL`, ngăn chặn Hibernate tự động gửi lệnh `FLUSH` không cần thiết về Database.
3. **Định tuyến Read-Replica (Nếu có):** Cho phép Driver định tuyến câu truy vấn về cụm Database Read-Only Slave.

---

## 4. 3 Bẫy Lỗi Kinh Điển & Kỹ Thuật Phòng Thủ

---

### Bẫy Lỗi 1: Bỏ Qua Proxy Do Gọi Nội Bộ (Self-Invocation Trap)
- **Hiện tượng:** Gọi phương thức `@Transactional` từ một phương thức khác **trong cùng một Class**:
  ```groovy
  @Service
  class AccountService {
      void processAll() {
          // ❌ LỖI: Gọi trực tiếp bỏ qua Spring AOP Proxy, @Transactional KHÔNG CÓ HIỆU LỰC!
          doSaveAccount() 
      }

      @Transactional(rollbackFor = [Exception.class])
      void doSaveAccount() { ... }
  }
  ```
- **Giải Pháp Chuẩn:**
  1. Tách phương thức sang một Service riêng biệt (`AccountPersistenceService`).
  2. Hoặc tự inject chính mình thông qua Spring ApplicationContext / `@Lazy`.

---

### Bẫy Lỗi 2: Chiếm Giữ DB Connection Khi Gọi API Bên Ngoài (Long-Running Transaction)
- **Hiện tượng:** Đặt `@Transactional` bao trùm cả quá trình gọi API bên thứ 3 (Keycloak, FPT e-Contract, 3rd-party Gateway):
  ```groovy
  // ❌ SAI: Connection DB bị chiếm giữ trong 3 - 5 giây chờ API ngoài phản hồi
  @Transactional(rollbackFor = [Exception.class])
  void openAccountAndSignContract() {
      accountRepository.save(account) // Mượn DB Connection
      externalClient.createContract() // Chờ HTTP ngoài (Tốn 3s -> Cạn kiệt HikariCP Connection Pool!)
      accountRepository.save(updatedAccount)
  }
  ```
- **Giải Pháp Chuẩn (Nguyên Tắc Ranh Giới Giao Dịch Hẹp):**
  1. Chỉ mở `@Transactional` ở phạm vi nhỏ nhất thao tác với DB.
  2. Thực hiện gọi API bên thứ 3 **bên ngoài Transaction DB**.

```groovy
// ✅ ĐÚNG: Tách biệt rõ ràng Non-Transactional I/O và Transactional Database Save
void openAccountAndSignContract() {
    // Bước 1: Lưu trạng thái PENDING trong Transaction nhỏ
    Account account = accountService.savePendingState(data)
    
    // Bước 2: Gọi dịch vụ ngoài (Không chiếm giữ Connection DB)
    def contractResp = externalClient.createContract(account)
    
    // Bước 3: Cập nhật kết quả vào DB trong Transaction nhỏ tiếp theo
    accountService.updateContractResult(account.id, contractResp)
}
```

---

### Bẫy Lỗi 3: Không Đồng Bộ Giữa DB Commit Và Redis Cache / Pub-Sub
- **Hiện tượng:** Cập nhật Cache hoặc bắn Redis Pub/Sub trước khi Database thực sự commit. Nếu DB commit bị lỗi (conflict/rollback), Cache và các dịch vụ khác đã nhận dữ liệu sai (Stale / Ghost Data).
- **Giải Pháp:** Sử dụng `TransactionSynchronizationManager.registerSynchronization`:

```groovy
@Transactional(rollbackFor = [Exception.class])
Account markSuccess(Account account) {
    account.status = AccountConstant.Status.SUCCESS
    Account saved = accountRepository.save(account)

    // BẮT BUỘC: Chỉ bắn sự kiện Redis sau khi Database đã COMMIT THÀNH CÔNG 100%
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
        @Override
        void afterCommit() {
            cacheService.publish(RedisKey.PARTNER_CHANNEL, "ACCOUNT_ACTIVATED:${saved.id}")
        }
    })

    return saved
}
```

---

## 5. Bảng Kiểm Định Trước Khi Hoàn Tất Code (Quality Gate)

| STT | Câu Hỏi Kiểm Định | Đạt Chuẩn |
| :---: | :--- | :---: |
| 1 | 100% `@Transactional` ghi dữ liệu đã có `rollbackFor = [Exception.class]` chưa? | ĐẠT |
| 2 | Mọi phương thức Query / Find chỉ đọc đã được gắn `@Transactional(readOnly = true)` chưa? | ĐẠT |
| 3 | Các tác vụ Audit Log / Error Tracking đã được tách ra với `Propagation.REQUIRES_NEW` chưa? | ĐẠT |
| 4 | Tuyệt đối KHÔNG bọc API call bên thứ 3 (Keycloak, FPT, Gateway) trong Transaction DB? | ĐẠT |
| 5 | Không có lỗi Self-Invocation (gọi hàm `@Transactional` cùng lớp) chưa? | ĐẠT |
| 6 | Sự kiện Redis Pub/Sub hoặc Cache Update đã được đặt trong `afterCommit()` chưa? | ĐẠT |
