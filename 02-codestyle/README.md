# 🎨 PHẦN 2: CODESTYLE & KỸ THUẬT LẬP TRÌNH BACKEND (02-codestyle)

> Bộ quy chuẩn kỹ thuật toàn diện, ranh giới kiến trúc 4 tầng, kỹ thuật lập trình phòng thủ và 13 kỹ năng code chuẩn Enterprise.

---

## 📂 CẤU TRÚC THƯ MỤC

```
02-codestyle/
├── rules/                              # 7 Quy Chuẩn Cốt Lõi (Single Source of Truth)
│   ├── api-design.md                   # Chuẩn thiết kế REST API & DTO Pattern
│   ├── async-integration.md            # Chuẩn tích hợp bất đồng bộ Kafka / RabbitMQ
│   ├── backend-feature.md              # Chuẩn phân tầng Clean 4-tier Architecture
│   ├── db-migration.md                 # Chuẩn DDL Migration & Soft Delete
│   ├── microservice-resilience.md      # Chuẩn Circuit Breaker & Timeout
│   ├── security.md                     # Chuẩn Zero-Trust & PII Masking
│   └── testing.md                      # Chuẩn Coverage >= 80%
│
└── skills/                             # 13 CodeStyle Skills
    ├── backend-api-design-flow/        # 5 bước thiết kế REST API chuẩn
    ├── clean-code-naming-conventions/  # Quy chuẩn đặt tên & State Transition Flow
    ├── database-transaction-management/# Quản trị @Transactional, chống block Pool
    ├── jpa-n-plus-one-optimization/    # Triệt tiêu bẫy N+1 Query
    ├── sql-repository-pattern/         # Parameterized Queries & Dynamic WHERE
    ├── redis-cache-patterns/           # Cache Realtime < 5ms, O(1), Pub/Sub
    ├── spring-middleware-pipeline/     # Filter Chain, Request Wrapper, MDC traceId
    ├── multi-language-error-handling/  # Quản lý từ điển đa ngữ tbl_lang qua Redis
    ├── db-migration/                   # Database Migration an toàn zero-downtime
    ├── db-interface-procedure-flow/    # Tích hợp Stored Procedures qua Adapter
    ├── defensive-troubleshooting-guide/# Sổ tay giải mã 10 bẫy lỗi kinh điển
    ├── git-workflow/                   # Conventional Commits & 2-Phase Branching
    └── safe-git-rebase/                # Git Rebase an toàn với --force-with-lease
```

---

## 🎯 CÁC NGUYÊN TẮC CỐT LÕI

1. **Clean 4-Tier Architecture**: Phân định ranh giới tuyệt đối giữa `Controller` (Lean) → `Service` (Business) → `Repository/Client` (I/O).
2. **Zero Entity Leakage**: Controller và Listener không bao giờ nhận hoặc trả Entity trực tiếp; 100% qua DTO.
3. **Structured Logging**: Mọi giao tiếp với 3rd-party, Database, Redis đều phải log qua `LogDTO` + `LogService` và che giấu (mask) dữ liệu nhạy cảm PII.
4. **Phòng Thủ Transaction**: Tuyệt đối không mở `@Transactional` bao trùm lệnh gọi mạng 3rd party (gây cạn kiệt Connection Pool).
