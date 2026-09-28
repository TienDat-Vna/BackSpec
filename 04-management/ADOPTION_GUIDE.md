# 📖 Hướng Dẫn Áp Dụng BackSpec SDD Cho Microservice

Tài liệu hướng dẫn tiếp nhận và áp dụng bộ công cụ **BackSpec (`backspec`)** vào dự án Backend Microservice.

## 🚀 Cách 1: Áp dụng tự động bằng BackSpec CLI (Khuyến nghị)
```bash
# Trong thư mục dự án microservice của bạn:
npx backspec init

# Hoặc áp dụng tự động cho service có sẵn ở đường dẫn khác:
npx backspec adopt ../my-existing-service

# Kiểm tra sức khỏe toàn diện sau khi khởi tạo:
npx backspec check
```

## 📦 Cách 2: Vận hành qua npm scripts
```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi tạo / chẩn đoán hệ thống
npm run check

# 3. Tạo spec cho tính năng mới
npm run spec feat-create-order

# 4. Đồng bộ rules & skills
npm run sync

# 5. Kiểm định tính toàn vẹn 4 phân tầng
npm run validate
```
