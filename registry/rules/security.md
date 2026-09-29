---
title: Security & Authentication Rules
scope: security
severity: must
tags: [security, auth, jwt, injection, secrets]
---


# Rule — Security & Authentication

Khi viết code liên quan đến xác thực, phân quyền hoặc bảo mật dữ liệu:

1. **Zero Hardcoded Secrets**: Tuyệt đối không commit password, API key, JWT secret, private key vào source code. Tất cả phải nạp từ biến môi trường.
2. **Fail-Fast Configuration**: Khi thiếu biến môi trường bắt buộc (như `JWT_SECRET`), ứng dụng phải báo lỗi và dừng khởi động ngay lập tức, không dùng secret mặc định.
3. **SQL Injection Protection**: ZERO TOLERANCE với việc cộng chuỗi SQL trực tiếp. Luôn sử dụng Parameterized Query hoặc ORM Parameter Binding.
4. **Phân quyền Đa cấp**: Xác thực cả Token Role, Tenant ID, và quyền sở hữu tài nguyên (Resource Ownership).
5. **CORS chặt chẽ**: Không bao giờ cấu hình `allowed_origins = ["*"]` trong môi trường production.
