---
name: knowledge-graph
description: Tra cứu kiến trúc hệ thống microservice, sơ đồ phụ thuộc giữa các package/service, API endpoints và event topics bằng sơ đồ tri thức.
allowed-tools: [Read, Grep, Glob]
---

<!-- GENERATED FROM .shared/skills/01-spec-management/knowledge-graph/SKILL.md — DO NOT EDIT DIRECTLY -->

# Skill — Knowledge Graph (Backend Microservices)

Tra cứu và nắm bắt nhanh mối liên hệ giữa các tầng trong microservice.

## Mục tiêu:
1. **Trace Request Flow**: Tìm đường đi từ Controller -> Service -> Repository -> External Clients.
2. **Trace Event Flow**: Tìm nơi Publish Event (Outbox/Kafka Producer) và các Event Consumers tương ứng.
3. **Trace Shared Models**: Xác định các DTOs dùng chung và quan hệ phụ thuộc giữa các Domain Packages.
