---
title: Async Integration & Messaging Rules
scope: messaging
severity: must
tags: [messaging, kafka, rabbitmq, outbox, event]
---
<!-- GENERATED FROM 02-codestyle/rules/async-integration.md — DO NOT EDIT DIRECTLY -->



# Rule — Async Integration & Event Messaging

Khi gửi/nhận thông điệp qua Event Broker (Kafka/RabbitMQ) hoặc tác vụ nền:

1. **Transactional Outbox**: Khi cần cập nhật DB và phát Event trong cùng một luồng nghiệp vụ, BẮT BUỘC sử dụng Transactional Outbox pattern để tránh mất message hoặc phát ghost message.
2. **Idempotent Consumers**: Mọi Consumer nhận message phải kiểm tra tính trùng lặp qua `event_id` hoặc bảng `processed_events`.
3. **Dead Letter Queue (DLQ)**: Consumer gặp lỗi chỉ được retry tối đa 3 lần với exponential backoff, sau đó đẩy sang DLQ topic. Không throw exception vô hạn làm nghẽn partition.
4. **CloudEvents Standard**: Cấu trúc payload của event phải tuân thủ chuẩn CloudEvents (id, source, type, time, datacontenttype, data).
