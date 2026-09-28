---
title: Backend Testing Rules
scope: testing
severity: must
tags: [testing, unit-test, integration-test, coverage]
---


# Rule — Testing Standard

Khi viết unit test hoặc integration test cho backend microservice:

1. **Ngưỡng Coverage tối thiểu**: Phải đạt đúng ngưỡng khai báo trong `CONSTITUTION.md §5` (mặc định >= 80% line coverage).
2. **Assertion thật**: Mỗi test case bắt buộc có ít nhất 1 assertion kiểm tra giá trị cụ thể. Không viết test chỉ gọi hàm để lấy độ phủ giả tạo.
3. **Test độc lập**: Mỗi test case phải tự cô lập dữ liệu (không phụ thuộc vào thứ tự chạy hoặc dữ liệu của test khác).
4. **Happy Path & Error Path**: Mọi endpoint/service method mới bắt buộc phải test cả luồng thành công và toàn bộ các trường hợp throw exception / validation error.
5. **Mock External Calls**: Unit test phải mock toàn bộ HTTP Client / Kafka Producer gọi ra bên ngoài.
