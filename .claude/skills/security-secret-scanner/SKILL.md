---
name: security-secret-scanner
description: Quét thời gian thực phát hiện rò rỉ API Keys, Token, Private Key, Database Credentials, thông tin PII (CCCD, SĐT, OTP) trong code, log và git diff.
allowed-tools: [Read, Grep, Glob, Bash]
---

<!-- GENERATED FROM registry/skills/security-secret-scanner/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/03-hooks/security-secret-scanner/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Security & Secret Scanner (Bộ Quét Bảo Mật & Rò Rỉ Thông Tin)

Skill này cung cấp cơ chế quét liên tục và tự động phát hiện mọi rủi ro lộ bí mật (Secret Leakage) và dữ liệu khách hàng nhạy cảm (PII).

## 🔍 CÁC MẪU DỮ LIỆU CẤM TUYỆT ĐỐI (ZERO-TOLERANCE PATTERNS)

| Danh mục | Mẫu vi phạm (Regex / Pattern) | Mức độ nghiêm trọng | Hành động |
|---|---|---|---|
| **API Secret / Key** | `(?i)(client_secret|clientsecret|secret_key|api_key)\s*[:=]\s*["'][A-Za-z0-9_\-]{8,}["']` | 🚨 CRITICAL | **HALT & BLOCK** |
| **AWS / Cloud Key** | `AKIA[0-9A-Z]{16}` / `aws_secret_access_key` | 🚨 CRITICAL | **HALT & BLOCK** |
| **Private Key** | `-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----` | 🚨 CRITICAL | **HALT & BLOCK** |
| **Raw JWT / Token** | `eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+` | 🚨 CRITICAL | **HALT & BLOCK** |
| **PII (CCCD 12 số)** | `\b[0-9]{12}\b` (khi in thẳng ra log mà không mask) | ⚠️ HIGH | **HALT & BLOCK** |
| **Password Hardcode** | `(?i)(password|passphrase|db_pass)\s*[:=]\s*["'][^"'\s]{4,}["']` | 🚨 CRITICAL | **HALT & BLOCK** |

## 🛡️ QUY CHUẨN MASKING BẮT BUỘC

Mọi dữ liệu nhạy cảm trước khi đưa vào `LogDTO` phải đi qua hàm mask:
```groovy
private String mask(String str) {
    if (!str) return str
    int len = str.length()
    if (len <= 4) return "*".repeat(len)
    return str.substring(0, 2) + "*".repeat(len - 4) + str.substring(len - 2)
}
```

## 🚨 KHI PHÁT HIỆN RÒ RỈ SECRET:
1. Dừng ngay lập tức quá trình build / commit / execution.
2. Xóa bỏ dòng code hoặc câu log vi phạm.
3. Chuyển credentials sang biến môi trường (`.env` không commit) hoặc Vault/Secret Manager.
