---
name: clean-code-naming-conventions
description: Bộ quy chuẩn đặt tên biến, hàm, hằng số, DTO, Database/Entity, REST API, Redis Key và mô hình quản lý luồng chuyển đổi trạng thái thực thể (State Transition Flow) chuẩn Enterprise.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM 02-codestyle/clean-code-naming-conventions/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/02-codestyle/clean-code-naming-conventions/SKILL.md — DO NOT EDIT DIRECTLY -->

# Quy Chuẩn Đặt Tên & Quản Lý Chuyển Đổi Trạng Thái (Enterprise Naming & State Transition Standards)

> **Dành cho AI Agent:** Tham khảo sơ đồ luồng logic và cây quyết định thực thi tại [AGENT_FLOW.md](./AGENT_FLOW.md).

Tài liệu này chuẩn hóa toàn diện 8 quy tắc đặt tên (Naming Conventions) và mô hình cập nhật trạng thái thực thể (State Transitions) xuyên suốt toàn bộ vòng đời phát triển trong hệ thống Backend Microservices (Spring Boot 3, Groovy/Java, JPA/Hibernate, Redis Cluster, RESTful API).

---

## 1. Nguyên Tắc Đặt Tên Biến & Thuộc Tính (Variables & Properties)

> **Mục tiêu:** Biến phải tự tài liệu hóa (Self-documenting), thể hiện đúng bản chất dữ liệu, không gây hiểu nhầm và không dùng chữ viết tắt tùy tiện.

### Quy Tắc Đặt Tên:
1. **Dùng Danh từ (Nouns) hoặc Cụm danh từ**:
   - Ví dụ: `userName`, `accountStatus`, `correlationId`, `idCode`, `partnerCode`, `custodycd`.
   - Tránh: Viết tắt tối nghĩa (`usrNm`, `accSts`, `data`, `val`, `temp`, `a`, `x`).
2. **Boolean Flags (Biến nhị phân / Điều kiện logic)**:
   - Luôn bắt đầu bằng tiền tố: `is`, `has`, `can`, `should`.
   - Ví dụ: `isSuccess`, `isUserLoggedIn`, `hasAccount`, `canRetry`, `shouldSyncContract`.
   - Tránh: Đặt tên không rõ ý nghĩa (`status`, `check`, `flag`, `userActive`).
3. **Collections (Danh sách / Tập hợp / Map)**:
   - Dùng dạng số nhiều hoặc hậu tố rõ ràng: `accounts`, `users`, `accountList`, `partnerMap`, `pendingRequests`.
   - Tránh: `accountArray`, `list`, `danhSach`.
4. **Số Đếm & Giới Hạn (Numbers & Limits)**:
   - Dùng các tiền tố định lượng: `total`, `max`, `min`, `count`.
   - Ví dụ: `totalRetryCount`, `maxUploadLimit`, `minDepositAmount`.

```groovy
// Bad: Tên biến tối nghĩa, generic, khó bảo trì
def d = getAcc(c)
boolean flag = true
int m = 5
def list1 = []

// Good: Rõ ràng, tự giải thích ngữ cảnh nghiệp vụ
Account account = findAccountByCustodycd(custodycd)
boolean isAccountActive = true
int maxRetryLimit = 5
List<Account> pendingAccounts = []
```

---

## 2. Nguyên Tắc Đặt Tên Hàm & Phương Thức (Methods & Functions)

> **Mục tiêu:** Hàm đại diện cho hành động hoặc quy trình nghiệp vụ, do đó **bắt buộc bắt đầu bằng Động từ (Verb-first)** và thể hiện chính xác mục đích duy nhất của hàm (Single Responsibility).

### Phân Loại Động Từ Theo Ngữ Cảnh Nghiệp Vụ:

| Nhóm Hành Động | Động Từ Tiêu Chuẩn (Prefix) | Ví Dụ Thực Tế trong Dự Án |
| :--- | :--- | :--- |
| **State Mutation (Đổi trạng thái)** | `mark...`, `update...`, `reset...` | `markSuccess(account)`, `markFailed(account, code, msg)`, `updateCustodycd(account, custodycd)`, `resetErrorStatus(account)` |
| **Data Query (Lấy dữ liệu)** | `get...`, `find...`, `fetch...` | `getAccountStatus(...)`, `findActivePartner(...)`, `findByIdCode(...)`, `fetchEContractDetails(...)` |
| **Verification (Kiểm tra điều kiện)** | `is...`, `has...`, `validate...`, `check...` | `isEligibleForOpening(...)`, `hasExistingRequest(...)`, `validateCustomerInfo(...)`, `checkCoreStatus(...)` |
| **Orchestration (Điều phối / Xử lý)** | `process...`, `handle...`, `execute...` | `processAccountOpening(...)`, `handlePartnerCallback(...)`, `executeDbInterfaceProcedure(...)` |
| **Transformation (Biến đổi dữ liệu)** | `to...`, `parse...`, `mask...`, `format...` | `toAccountStatusResp(...)`, `parseResponseBody(...)`, `maskIdCode(...)`, `formatDate(...)` |

---

## 3. Mô Hình Chuyển Đổi Trạng Thái Chuẩn (State Transition Helper Pattern)

Trong các luồng nghiệp vụ phức tạp (như Mở tài khoản, Giao dịch thanh toán, Ký hợp đồng điện tử), việc quản lý trạng thái của bản ghi Entity cần tuân thủ cấu trúc tách nhỏ thành các hàm chuyên biệt:

```groovy
/**
 * Cập nhật định danh tài khoản sau khi sinh thành công từ Core.
 */
Account updateCustodycd(Account account, String custodycd) {
    account.custodycd = custodycd
    return accountRepository.save(account)
}

/**
 * Đi hết toàn bộ quy trình: Đánh dấu SUCCESS và xoá vết lỗi cũ (nếu là lần chạy retry).
 */
Account markSuccess(Account account) {
    account.status = AccountConstant.Status.SUCCESS
    account.errorCode = null
    account.errorMessage = null
    return accountRepository.save(account)
}

/**
 * Xảy ra lỗi ở bất kỳ bước nào: Đánh dấu FAILED kèm mã lỗi và thông điệp.
 * Lưu ý phòng thủ: Lỗi khi lưu trạng thái chỉ log cảnh báo, không che mất ngoại lệ gốc của luồng chính.
 */
Account markFailed(Account account, String errorCode, String errorMessage) {
    try {
        account.status = AccountConstant.Status.FAILED
        account.errorCode = errorCode
        account.errorMessage = errorMessage
        return accountRepository.save(account)
    } catch (Exception e) {
        log.error("[AccountService.markFailed] id = ${account?.id} step = ${account?.step} error = ${e.message}")
        return account
    }
}
```

> [!IMPORTANT]
> **Quy tắc an toàn trong `markFailed`:**
> 1. Hàm `markFailed` chỉ đóng vai trò ghi nhận trạng thái phụ (Audit/State Tracking).
> 2. Nếu việc lưu vào DB gặp lỗi (ví dụ nghẽn DB), ta bắt `try-catch` cục bộ và ghi log, không ném ngoại lệ mới để đảm bảo ngoại lệ nghiệp vụ chính (`APIException`) được trả về trọn vẹn cho Controller/Client.

---

## 4. Quy Chuẩn Đặt Tên Class, DTO, Constant & Enum

### 1. Classes & Components
- **Quy tắc:** `PascalCase`, thể hiện rõ vai trò tầng kiến trúc.
- **Ví dụ:** `AccountService`, `AccountController`, `KeyCloakService`, `AccountRepository`.

### 2. DTOs (Data Transfer Objects)
- **Quy tắc:** Đặt tên kèm mục đích và chiều dữ liệu:
  - Request DTO: Hậu tố `DTO` hoặc `Req` (`LoginDTO`, `CreateAccountDTO`, `CheckIdCodeReq`).
  - Response DTO: Hậu tố `Resp` hoặc `Response` (`AccountStatusResp`, `LoginResp`, `KeyCloakTokenResp`).

### 3. Hằng Số (Constants) & Enums
- **Quy tắc:** `SCREAMING_SNAKE_CASE`, gom nhóm theo lớp tĩnh hoặc Enum để tránh magic strings.
- **Ví dụ:**
  ```groovy
  class AccountConstant {
      static class Status {
          static final String PENDING = "PENDING"
          static final String PROCESSING = "PROCESSING"
          static final String SUCCESS = "SUCCESS"
          static final String FAILED = "FAILED"
      }
      
      static class Step {
          static final String STEP_1_CHECK_IDCODE = "STEP_1_CHECK_IDCODE"
          static final String STEP_2_OPEN_ACCOUNT = "STEP_2_OPEN_ACCOUNT"
          static final String STEP_3_CREATE_CONTRACT = "STEP_3_CREATE_CONTRACT"
      }
  }
  ```

---

## 5. Chuẩn Hóa Tên Bảng, Cột Database & JPA Entity Mapping

> **Mục tiêu:** Đồng bộ giữa Database Schema (MySQL/PostgreSQL/Oracle) và các Entity JPA trong Groovy/Java.

### Quy Tắc Đặt Tên:
1. **Tên Bảng (Database Table):**
   - Tiền tố `tbl_` + `snake_case` số ít.
   - Ví dụ: `tbl_account`, `tbl_partner`, `tbl_lang`, `tbl_config_partner`.
2. **Tên Cột DB (Database Column):**
   - Định dạng `snake_case`, tên rõ nghĩa, cột cờ bắt đầu bằng `is_`.
   - Ví dụ: `custodycd`, `id_code`, `partner_code`, `created_date`, `is_active`, `error_code`.
3. **Thuộc Tính Entity JPA (Entity Properties):**
   - Định dạng `camelCase` ánh xạ tương ứng 1-1 với cột DB.

```groovy
@Entity
@Table(name = "tbl_account")
class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id

    @Column(name = "partner_code", nullable = false)
    String partnerCode

    @Column(name = "id_code", nullable = false)
    String idCode

    @Column(name = "custodycd")
    String custodycd

    @Column(name = "status")
    String status

    @Column(name = "is_active")
    Boolean isActive = true

    @Column(name = "created_date")
    Date createdDate = new Date()
}
```

---

## 6. Chuẩn Hóa RESTful API Endpoints & URL Paths

> **Mục tiêu:** Cung cấp API Contract chuẩn cho Clients, Mobile App và Đối tác bên thứ 3.

### Quy Tắc Thiết Kế URL:
1. **Resource URI:** Dùng danh từ số nhiều + `kebab-case`.
2. **Không dùng Động từ trong URL:** Hành động được đại diện bởi phương thức HTTP (`GET`, `POST`, `PUT`, `DELETE`).
3. **Tham số Path & Query:** Thống nhất dùng `camelCase` cho query/path parameters.

| Phương Thức HTTP | Endpoint Chuẩn (Good Practice) | Không Khuyến Khích (Bad Practice) | Ý Nghĩa Nghiệp Vụ |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | `/api/v1/auth/doLogin` | Xác thực đối tác |
| `POST` | `/partner/{partnerCode}/api/v1/accounts` | `/partner/{partnerCode}/api/v1/createAccount` | Đăng ký mở tài khoản |
| `GET` | `/partner/{partnerCode}/api/v1/accounts/status` | `/partner/{partnerCode}/api/v1/getAccountStatus` | Tra cứu trạng thái |
| `POST` | `/partner/{partnerCode}/api/v1/contracts/e-sign` | `/partner/{partnerCode}/api/v1/doSignContract` | Ký hợp đồng điện tử |

---

## 7. Chuẩn Hóa Redis Cache Keys & Pub/Sub Channels

> **Mục tiêu:** Ngăn chặn việc trùng lặp khóa (Key Collision) và tối ưu hóa hiệu năng tra cứu O(1) trên Redis Cluster.

### Quy Tắc Đặt Tên:
1. **Redis Cache Keys:** Phân cấp dữ liệu theo cú pháp `namespace:entity:identifier`.
   - Token & Profile: `kb:partner:profile:{clientId}`
   - Idempotency Locks: `kb:idempotency:account:{requestId}`
   - Otp / Rate Limit: `kb:ratelimit:{partnerCode}:{clientIp}`
2. **Redis Pub/Sub Channels:** Sử dụng `snake_case` có tiền tố định danh hệ thống.
   - Ví dụ: `kb_partner_channel`, `account_sync_channel`, `lang_cache_sync_channel`.

```groovy
class RedisKey {
    // Prefix gom nhóm namespace
    static final String HASH_KEY = "kb:partner:"
    static final String PROFILE_KEY = "profile"
    static final String IDEMPOTENCY_PREFIX = "kb:idempotency:"
    
    // Pub/Sub Channel
    static final String PARTNER_CHANNEL = "kb_partner_channel"
}
```

---

## 8. Chuẩn Hóa Package & Unit Test Conventions (BDD Style)

### 1. Package Naming
- **Quy tắc:** 100% `lowercase`, không có ký tự đặc biệt hay gạch dưới.
- **Ví dụ:** `com.service`, `com.controller`, `com.dto.request`, `com.repository`.

### 2. Test Classes & Test Methods
- **Tên Class Test:** `<TargetClass>Spec` (cho Spock Framework) hoặc `<TargetClass>Test` (cho JUnit).
- **Tên Method Test (BDD Pattern / Given-When-Then):**

```groovy
class AccountServiceSpec extends Specification {

    def "should mark account status as SUCCESS and clear old errors when process completes"() {
        given: "An existing account with previous error"
        Account account = new Account(status: "PROCESSING", errorCode: "400001", errorMessage: "Old error")

        when: "Calling markSuccess"
        Account result = accountService.markSuccess(account)

        then: "Status is SUCCESS and error fields are cleared"
        result.status == AccountConstant.Status.SUCCESS
        result.errorCode == null
        result.errorMessage == null
    }

    def "should return account status when idCode exists in database"() {
        // ...
    }
}
```

---

## 9. Bảng Đối Chiếu Code Review Toàn Diện (Master Review Checklist)

| Phạm Vi | Không Khuyến Khích (Bad Practice) | Khuyến Khích Sử Dụng (Good Practice) |
| :--- | :--- | :--- |
| **Biến Boolean** | `def checked = true` / `def flag = false` | `boolean isIdCodeValid = true` / `boolean hasActiveContract = false` |
| **Tên Biến Dữ Liệu** | `def obj = getObj()` / `def res = ...` | `Account account = findAccountById(id)` / `GeneralResponse<AccountStatusResp> response = ...` |
| **Tên Hàm Đổi Trạng Thái** | `def setOk(acc)` / `def changeStatus(acc)` | `Account markSuccess(Account account)` / `Account markFailed(Account account, String code, String msg)` |
| **Tên Hàm Query** | `def data(id)` / `def run(req)` | `AccountStatusResp getAccountStatus(String idCode, String partnerCode, String requestId)` |
| **Hardcode Giá Trị Trạng Thái** | `account.status = "SUCCESS"` (Magic String) | `account.status = AccountConstant.Status.SUCCESS` |
| **Bọc Trạng Thái Khi Retry** | Chỉ gán `status = SUCCESS` quên xoá `errorCode` cũ | Gán `status = SUCCESS`, đồng thời set `errorCode = null`, `errorMessage = null` |
| **Tên Bảng / Cột DB** | `accounts` / `custody_Cd` / `isactive` | `tbl_account` / `custodycd` / `is_active` |
| **REST API Endpoint** | `POST /api/v1/accounts/createAccount` | `POST /partner/{partnerCode}/api/v1/accounts` |
| **Redis Cache Key** | `set("req_" + reqId, ...)` | `set("kb:idempotency:account:" + reqId, ...)` |
| **Tên Hàm Unit Test** | `test1()`, `testAccount()` | `shouldReturnSuccessWhenIdCodeIsValid()` |
