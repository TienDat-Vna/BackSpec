---
name: defensive-troubleshooting-guide
description: Cẩm nang lập trình phòng thủ (Defensive Programming) và sổ tay giải mã 10 bẫy lỗi kinh điển trong hệ thống Backend Enterprise: Silent Catch, Rò rỉ PII, Thiếu Timeout, Memory Leak, Quên Idempotency, Hardcode i18n, NullPointerException và vi phạm ranh giới DB Core.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM 02-codestyle/defensive-troubleshooting-guide/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/02-codestyle/defensive-troubleshooting-guide/SKILL.md — DO NOT EDIT DIRECTLY -->

# Lập Trình Phòng Thủ & Sổ Tay 10 Bẫy Lỗi Thực Chiến (Defensive Troubleshooting Guide)

Skill này tổng hợp 10 bẫy lỗi kinh điển trong các dự án Backend Spring Boot / Groovy / Java cấp doanh nghiệp, được đúc kết từ quá trình code review và bảo trì hệ thống thực tế.

---

## 🧭 Bảng Tổng Hợp 10 Lỗi Kỹ Thuật & Giải Pháp Khắc Phục

---

### 🚨 LỖI 1: Nuốt Lỗi Âm Thầm (Silent Catch) -> Trả Về Fake 200 OK
- **Nguyên nhân:** Bọc `try/catch` rồi khi DB/External API sập lại `return null` hoặc chỉ in `println("Error")`.
- **Hậu quả:** Trả về HTTP `200 OK` giả mạo, che giấu sự cố hạ tầng, khiến hệ thống giám sát ELK/Prometheus không thể kích hoạt cảnh báo.
- **Giải pháp:** Áp dụng triết lý Fail-Fast:
  ```groovy
  // ❌ SAI:
  catch (Exception e) {
      println "Lỗi rồi: " + e.message
      return null
  }

  // ✅ ĐÚNG:
  catch (Exception e) {
      log.error("[traceId: {}] Error executing DB-Interface PR_CHECK_IDCODE: {}", traceId, e.message, e)
      throw new APIException(ErrorCodeDetail.DB_INTERFACE_ERROR)
  }
  ```

---

### 🚨 LỖI 2: Log Rác (Spam) ở Controller & Thiếu Structured Log (`LogDTO`) tại Ranh Giới I/O
- **Nguyên nhân:** Ghi `log.info(...)` rải rác ở Controller/Service nội bộ (gây nghẽn I/O và loãng log), nhưng lại không log đầy đủ request/response/error khi gọi sang hệ thống bên ngoài (Keycloak, Customer MS, DB Core).
- **Hậu quả:** Khi hệ thống có hàng nghìn RPS, log bị quá tải (noise), còn khi bên thứ 3 lỗi lại không biết được input gửi đi là gì và body lỗi trả về là gì để debug.
- **Giải pháp:** 
  - Loại bỏ log thừa ở Controller & Service nội bộ (để Filter quản lý).
  - Bắt buộc inject `@Autowired LogService log;` và ghi `new LogDTO(...)` tại các Integration Clients (Keycloak, Customer MS, DB-Interface).
  - Trích xuất `status` và `exceptionBody` từ `HttpStatusCodeException` vào `LogDTO.error`.

---

### 🚨 LỖI 3: In Lộ Thông Tin Nhạy Cảm (PII Data Leak) Ra Log
- **Nguyên nhân:** Log trực tiếp số CCCD, Số điện thoại, Email hoặc chuỗi Raw Base64 ảnh khuôn mặt.
- **Hậu quả:** Vi phạm nghiêm trọng Luật An toàn Thông tin và quy định bảo mật dữ liệu.
- **Giải pháp:** Sử dụng `StringUtils.mask()`:
  ```groovy
  log.info("[traceId: {}] Customer CCCD: {}, Phone: {}", traceId, 
           StringUtils.maskIdCode(req.idCode), 
           StringUtils.maskPhone(req.mobilePhone))
  ```

---

### 🚨 LỖI 4: Hardcode Thông Báo Lỗi Trực Tiếp Trong Mã Nguồn
- **Nguyên nhân:** Viết `throw new RuntimeException("Khách hàng đã có tài khoản")`.
- **Hậu quả:** Không hỗ trợ đa ngôn ngữ (VI/EN) và khi nghiệp vụ đổi câu chữ bắt buộc phải build lại JAR và redeploy.
- **Giải pháp:** Định nghĩa mã trong `ErrorCodeDetail` và nạp bản dịch động qua `LangService` (Database `tbl_lang`).

---

### 🚨 LỖI 5: Kết Nối Trực Tiếp Database Core / Legacy
- **Nguyên nhân:** Tạo `DataSource` hoặc `EntityManager` kết nối thẳng đến schema Database Core.
- **Hậu quả:** Rủi ro khóa bảng (deadlock), phụ thuộc chặt vào schema Core và vi phạm chính sách bảo mật nội bộ.
- **Giải pháp:** Gọi 100% qua lớp trừu tượng **Adapter Client Pattern** (`IDbInterfaceClient`).

---

### 🚨 LỖI 6: Bỏ Quên Idempotency -> Gửi Lặp Request Tạo Trùng Dữ Liệu
- **Nguyên nhân:** Không kiểm tra trạng thái của `requestId` trước khi thực thi chuỗi giao dịch.
- **Hậu quả:** Người dùng bấm nút nhiều lần dẫn đến sinh nhiều bản ghi trùng lặp hoặc giao dịch kép.
- **Giải pháp:** Khóa `requestId` vào Redis với TTL 24h bằng `setIfAbsent()`.

---

### 🚨 LỖI 7: Thiếu Timeout Trên RestTemplate / WebClient
- **Nguyên nhân:** Dùng `new RestTemplate()` mặc định không cấu hình Connect/Read Timeout.
- **Hậu quả:** Khi dịch vụ ngoài bị treo, toàn bộ worker thread của Tomcat bị chiếm giữ dẫn đến sập toàn bộ ứng dụng (Thread Starvation).
- **Giải pháp:** Bắt buộc cấu hình Connect Timeout ($< 3s$) và Read Timeout ($< 5s$).

---

### 🚨 LỖI 8: Không Đóng Stream / Resource (Rò Rỉ Bộ Nhớ - Memory Leak)
- **Nguyên nhân:** Mở `InputStream`, `ByteArrayOutputStream` hoặc kết nối socket mà không đóng.
- **Hậu quả:** Gây cạn kiệt heap memory và lỗi `java.lang.OutOfMemoryError: Java heap space`.
- **Giải pháp:** Sử dụng cú pháp `try-with-resources`.

---

### 🚨 LỖI 9: Lỗi `NullPointerException` Khi Truy Cập Dữ Liệu Lồng Nhau
- **Nguyên nhân:** Gọi `body.getServices().getIsMargin()` khi `services == null`.
- **Giải pháp:** Dùng Safe Navigation Operator của Groovy / Optional Java: `body?.services?.isMargin ?: false`.

---

### 🚨 LỖI 10: Quên Validate DTO Đầu Vào Ở Tầng Controller
- **Nguyên nhân:** Quên gắn `@Valid` trước `@RequestBody`, khiến dữ liệu rỗng lọt xuống tầng dưới làm crash ứng dụng.
- **Giải pháp:** Gắn đầy đủ annotation Jakarta Validation (`@NotNull`, `@NotBlank`, `@Pattern`) tại DTO và `@Valid` tại Controller method.

---

## ✅ Checklist Lập Trình Phòng Thủ (Defensive Coding Checklist)
1. [ ] Sử dụng Safe Navigation (`?.`) và toán tử Elvis (`?:`) để xử lý `null` an toàn.
2. [ ] Masking toàn bộ thông tin PII trước khi log ra Logstash.
3. [ ] Bắt buộc log kèm `traceId` và exception message trong khối `catch` trước khi ném lại `APIException`.
4. [ ] Cấu hình Connect/Read Timeout trên toàn bộ kết nối HTTP ra ngoài.
5. [ ] Tuyệt đối không dùng `return null` để che giấu lỗi hệ thống.
