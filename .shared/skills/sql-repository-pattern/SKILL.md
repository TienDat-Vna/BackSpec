---
name: sql-repository-pattern
description: Kỹ thuật xây dựng Repository, Parameterized Queries chống SQL Injection, Dynamic WHERE clause, Transaction Management và Direct Pass-Through tối ưu cho Spring Boot / MySQL.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM 02-codestyle/sql-repository-pattern/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/02-codestyle/sql-repository-pattern/SKILL.md — DO NOT EDIT DIRECTLY -->

# Kỹ Thuật Xây Dựng Repository Pattern & Parameterized SQL

Skill này cung cấp các nguyên tắc kiến trúc và mẫu code chuẩn mực khi làm việc với cơ sở dữ liệu quan hệ (Spring Data JPA & Spring JdbcTemplate) trong các hệ thống backend enterprise.

---

## 1. 🏛️ Nguyên Tắc Thiết Kế

### 1.1. Tách biệt Trách nhiệm (Separation of Concerns)
- **Service Layer**: Chỉ gọi Repository để lấy dữ liệu, không tự tạo kết nối Database hay viết chuỗi SQL thô trực tiếp trong Service.
- **Repository Layer**: Chịu trách nhiệm thực thi truy vấn JPA / SQL qua Spring Data `JpaRepository` hoặc `JdbcTemplate`.

### 1.2. Triết lý Direct Pass-Through
- Đặt bí danh cột (`AS requestId`, `AS fullName`, `AS status`) khớp chính xác với DTO Output Contract.
- Repository trả về kết quả map tự động qua JPA Entity hoặc RowMapper, tránh chạy vòng lặp thủ công làm tăng Garbage Collector overhead.

---

## 2. 🛡️ Phòng Chống SQL Injection (Parameterized Queries)

- **❌ CẤM TUYỆT ĐỐI**: Nối chuỗi biến trực tiếp vào SQL:
  ```groovy
  // RỦI RO BỊ SQL INJECTION
  String sql = "SELECT * FROM tbl_account_register WHERE partner_code = '" + partnerCode + "'"
  ```
- **✅ CHUẨN MỰC**: Dùng placeholder `?` hoặc NamedParameter và truyền mảng tham số:
  ```groovy
  // AN TOÀN - JdbcTemplate tự động escape tham số
  String sql = "SELECT * FROM tbl_account_register WHERE partner_code = ? AND id_code = ?"
  List<AccountRegister> list = jdbcTemplate.query(sql, rowMapper, partnerCode, idCode)
  ```

---

## 3. 🧩 Dynamic WHERE Clause Linh Hoạt

Áp dụng khi cần tìm kiếm hồ sơ linh hoạt theo nhiều tiêu chí (Search / Filter):

```groovy
StringBuilder sql = new StringBuilder("""
    SELECT r.id, r.request_id AS requestId, r.partner_code AS partnerCode,
           r.id_code AS idCode, r.full_name AS fullName, r.status, r.created_at AS createdAt
    FROM tbl_account_register r
    WHERE r.created_at >= ?
""")
List<Object> params = [fromDate]

if (partnerCode) {
    sql.append(" AND r.partner_code = ?")
    params.add(partnerCode)
}

if (status) {
    sql.append(" AND r.status = ?")
    params.add(status)
}

if (idCode) {
    sql.append(" AND r.id_code = ?")
    params.add(idCode)
}

sql.append(" ORDER BY r.created_at DESC")

return jdbcTemplate.query(sql.toString(), params.toArray(), new BeanPropertyRowMapper<>(AccountRegisterDTO.class))
```

---

## 4. ✅ Checklist Tự Kiểm Tra (Repository Self-Checklist)
- [ ] **Tách tầng**: Toàn bộ thao tác Database nằm trong `repository/`, Service không chứa SQL thô.
- [ ] **Bảo mật**: Sử dụng 100% Parameterized queries (`?`), không nối chuỗi biến vào WHERE.
- [ ] **Indexing**: Đảm bảo các cột tìm kiếm thường xuyên (`request_id`, `partner_code`, `id_code`, `status`) đã được đánh Index trong bảng Database.
- [ ] **Transaction**: Các thao tác ghi đồng thời nhiều bảng phải được đánh dấu `@Transactional`.
