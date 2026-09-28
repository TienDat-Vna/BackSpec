---
name: backend-api-design-flow
description: Quy trình 5 bước thiết kế và triển khai REST API chuẩn Enterprise: Blueprint Sequence Diagram, Fail-Fast Input Validation, Clean 4-tier Architecture, MDC Structured Logging và Response Standardization.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM .shared/skills/02-codestyle/backend-api-design-flow/SKILL.md — DO NOT EDIT DIRECTLY -->

# Quy Trình 5 Bước Thiết Kế & Triển Khai Backend REST API Chuẩn Enterprise

Skill này cung cấp quy trình chuẩn mực từng bước để xây dựng một REST API Endpoint hoàn chỉnh, tuân thủ kiến trúc phân tầng Clean Architecture và đáp ứng 100% các tiêu chuẩn bảo mật, truy vết log và tính mở rộng của hệ thống Backend Microservices.

---

## 1. 📐 Bước 1: Phác Thảo Sequence Diagram & API Contract Blueprint
- **Trước khi viết bất kỳ dòng code nào**, xác định rõ:
  - Phương thức HTTP & Đường dẫn: `POST /api/v1/{resource}` hoặc `/partner/{partnerCode}/api/v1/{resource}`
  - Input Schema: Các trường bắt buộc, kiểu dữ liệu, constraints format.
  - Output Schema: Cấu trúc bọc trong `GeneralResponse<T>` hoặc Response DTO chuẩn.
  - Luồng tương tác giữa Controller -> Service -> Repository / Cache / External Integration Clients.

---

## 2. 🛡️ Bước 2: Thiết Kế DTOs & Fail-Fast Input Validation
- Đặt trong package `dto.request` và `dto.response` (tuyệt đối không để lộ Entity).
- Sử dụng đầy đủ annotation Jakarta Bean Validation:
  - `@NotNull(message = "400000")`, `@NotBlank(message = "400000")`
  - `@Pattern(regexp = "^[0-9]{12}$", message = "Số định danh không hợp lệ")`
  - `@Size(min = 1, max = 50)`
- Thêm phương thức helper (vd: `getMaskedIdCode()`) để log an toàn mà không làm lộ dữ liệu nhạy cảm PII.

---

## 3. 🎯 Bước 3: Lean REST Controller (Không Log Spam)
- Sử dụng annotation chuẩn: `@RestController`, `@RequestMapping`.
- **Nguyên tắc Lean Controller**: Đóng vai trò là HTTP Gateway tối giản. Chỉ validate DTO (`@Valid`) và gọi thẳng Service (`return ResponseEntity.ok(service.method(data))`).
- **Không log thủ công trong Controller**: Tầng Filter/Gateway (`RequestIdFilter`, `JwtAuthenticationFilter`) đã tự động trích xuất và quản lý `traceId`/`x-request-id` trong MDC.

```groovy
@RestController
@RequestMapping(path = ["/api/v1/auth"])
class AuthController {

    @Autowired
    private AuthService authService

    @PostMapping(path = ["/login"])
    ResponseEntity<GeneralResponse<LoginResp>> login(@Valid @RequestBody LoginDTO data) {
        GeneralResponse<LoginResp> response = authService.login(data)
        return ResponseEntity.ok(response)
    }
}
```

---

## 4. ⚙️ Bước 4: Service Layer & Structured Logging at Integration Boundaries
- **Service Layer**: Chuyên trách điều phối nghiệp vụ, validate sớm (Fail-Fast), kiểm tra Idempotency qua Redis và ném ngoại lệ tường minh (`throw new APIException(ErrorCodeDetail.USER_NOT_EXIST)`).
- **External Integration Clients / Boundary Layer (Keycloak, 3rd-party APIs, Core Flex, e-Contract)**:
  - Bắt buộc inject `@Autowired LogService log;` và sử dụng `LogDTO`.
  - Sinh `correlationId = UUID.randomUUID().toString()`.
  - Ghi log `log.info(new LogDTO(...))` sau khi gọi dịch vụ bên ngoài thành công.
  - Ghi log `log.error(new LogDTO(...))` khi nhận lỗi HTTP từ 3rd party (`HttpStatusCodeException`) hoặc lỗi kết nối/hệ thống (`Exception`).

```groovy
// Mẫu chuẩn ghi log giao tiếp bên thứ 3 (LogService + LogDTO)
try {
    ResponseEntity<KeyCloakTokenResp> response = restTemplate.postForEntity(tokenUrl, requestEntity, KeyCloakTokenResp.class)
    log.info(new LogDTO(
        service: KeyCloakService.getSimpleName(),
        step: "getToken",
        correlationId: correlationId,
        url: tokenUrl,
        method: HttpMethod.POST,
        input: [headers: headers, body: maskedBody],
        output: [status: response.statusCode, body: response.body]
    ))
    return response.body
} catch (HttpStatusCodeException e) {
    log.error(new LogDTO(
        service: KeyCloakService.getSimpleName(),
        step: "getToken",
        correlationId: correlationId,
        url: tokenUrl,
        method: HttpMethod.POST,
        input: [headers: headers, body: maskedBody],
        error: [message: e.message, status: e.statusCode, body: e.getResponseBodyAs(Map.class)]
    ))
    throw new APIException(ErrorCodeDetail.UNAUTHENTICATED)
}
```

---

## 5. 🌐 Bước 5: Phản Hồi Chuẩn Hóa & Quản Lý Lỗi Toàn Cục
- Toàn bộ kết quả trả về phía Client phải đi qua `GeneralResponse<T>` hoặc Response DTO:
  - Thành công: `GeneralResponse<T>(value: data)` (HTTP 200 / 201).
  - Thất bại: Bắt tại `APIExceptionHandler` / Global Exception Handler, ném mã lỗi trong `ErrorCodeDetail`, dịch mã lỗi qua `LangService`/`MessageSource` theo `LocaleContextHolder` và trả về HTTP Status tương ứng (RFC 7807).
