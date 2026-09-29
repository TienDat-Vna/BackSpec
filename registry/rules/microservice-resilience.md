---
title: Microservice Resilience & Fault Tolerance
scope: universal
severity: must
tags: [resilience, circuit-breaker, timeout, retry, fallback]
---


# Rule — Microservice Resilience

Khi thực hiện lời gọi mạng (HTTP/gRPC) sang microservice khác hoặc 3rd-party API:

1. **Timeout bắt buộc**: Mọi network call phải có cấu hình timeout rõ ràng (thường 2s - 5s). Không bao giờ để timeout vô hạn (`timeout: 0`).
2. **Circuit Breaker**: Cấu hình Circuit Breaker cho các service phụ thuộc quan trọng để ngắt mạch khi tỷ lệ lỗi vượt ngưỡng, tránh sụp đổ dây chuyền.
3. **Graceful Degradation (Fallback)**: Khi service ngoài bị sập, luôn có fallback trả về dữ liệu cache hoặc phản hồi nhẹ nhàng, không để crash ứng dụng.
4. **Correlation / Trace ID**: Luôn truyền `X-Correlation-ID` hoặc `traceparent` (W3C Trace Context) qua mọi lời gọi mạng để trace log xuyên suốt hệ thống.
