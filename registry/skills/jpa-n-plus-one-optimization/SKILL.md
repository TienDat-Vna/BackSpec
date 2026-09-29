---
name: jpa-n-plus-one-optimization
description: Kỹ thuật phát hiện, tối ưu và triệt tiêu bẫy N+1 Query trong Spring Data JPA / Hibernate: JOIN FETCH, @EntityGraph, DTO Projections, Batch Size và giám sát hiệu năng truy vấn.
allowed-tools: [Read, Edit, Write, Grep, Glob]
---

<!-- GENERATED FROM .shared/skills/02-codestyle/jpa-n-plus-one-optimization/SKILL.md — DO NOT EDIT DIRECTLY -->

# Quy Chuẩn Tối Ưu & Triệt Tiêu Bẫy N+1 Query (JPA / Hibernate Optimization)

Tài liệu này cung cấp các giải pháp kỹ thuật toàn diện nhằm loại bỏ hoàn toàn hiện tượng **N+1 Query Problem** trong các ứng dụng Spring Boot sử dụng Spring Data JPA, Hibernate và cơ sở dữ liệu quan hệ.

---

## 1. Bản Chất Của Bẫy N+1 Query

### Hiện Tượng:
Khi truy vấn 1 danh sách gồm $N$ bản ghi cha (Parent Entity) và truy cập vào trường quan hệ Lazy Loading (con - Child Entity), Hibernate sẽ tự động bắn thêm $N$ câu truy vấn `SELECT` phụ vào Database.

```text
1 câu truy vấn ban đầu:  SELECT * FROM tbl_account WHERE status = 'SUCCESS' (Trả về N bản ghi)
N câu truy vấn phụ lặp:  SELECT * FROM tbl_partner WHERE partner_code = ?   (Chạy N lần trong vòng lặp)
==> Tổng số query: 1 + N (Gây nghẽn Database Pool và suy giảm hiệu năng nghiêm trọng)
```

---

## 2. 4 Chiến Lược Triệt Tiêu N+1 Query Chuẩn Enterprise

### Chiến Lược 1: Sử Dụng `JOIN FETCH` Trong JPQL / HQL (Khuyến Nghị Hàng Đầu)

`JOIN FETCH` yêu cầu Hibernate tải đồng thời toàn bộ dữ liệu của Entity liên quan trong **1 câu truy vấn SQL duy nhất** (INNER JOIN hoặc LEFT JOIN).

```groovy
interface AccountRepository extends JpaRepository<Account, Long> {

    // Tránh N+1: Lấy cả thông tin Account và Partner liên kết chỉ trong 1 câu SQL
    @Query("SELECT a FROM Account a JOIN FETCH a.partner WHERE a.status = :status")
    List<Account> findAllWithPartnerByStatus(@Param("status") String status)

    // Left Join Fetch khi quan hệ có thể là null
    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.contracts WHERE a.partnerCode = :partnerCode")
    List<Account> findAllWithContractsByPartnerCode(@Param("partnerCode") String partnerCode)
}
```

---

### Chiến Lược 2: Sử Dụng `@EntityGraph` (Tùy Biến Linh Hoạt Cho Từng Phương Thức)

`@EntityGraph` cho phép ghi đè cơ chế `FetchType.LAZY` thành `FetchType.EAGER` một cách linh hoạt tại từng phương thức của Repository mà không cần viết lại toàn bộ câu query JPQL.

```groovy
interface AccountRepository extends JpaRepository<Account, Long> {

    @EntityGraph(attributePaths = ["partner", "config"])
    List<Account> findByStatus(String status)

    @EntityGraph(attributePaths = ["contracts"])
    Optional<Account> findByIdCode(String idCode)
}
```

---

### Chiến Lược 3: DTO Projections (Direct Pass-Through - Tối Ưu Tối Đa RAM & CPU)

Khi chỉ cần đọc dữ liệu để hiển thị hoặc trả về response cho Client, không cần nạp toàn bộ Entity vào Hibernate Persistence Context (L1 Cache). Áp dụng DTO Projection để chỉ SELECT đúng các cột cần thiết:

```groovy
// 1. Định nghĩa Interface DTO Projection
interface AccountSummaryProjection {
    Long getId()
    String getCustodycd()
    String getIdCode()
    String getPartnerName() // Lấy từ bảng liên kết
}

// 2. Định nghĩa Repository Query
interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("""
        SELECT a.id as id, a.custodycd as custodycd, a.idCode as idCode, p.name as partnerName
        FROM Account a 
        JOIN Partner p ON a.partnerCode = p.code
        WHERE a.createdDate >= :fromDate
    """)
    List<AccountSummaryProjection> findAccountSummaries(@Param("fromDate") Date fromDate)
}
```

---

### Chiến Lược 4: Cấu Hình Global Batch Fetching (`default_batch_fetch_size`)

Cấu hình kích thước nạp theo lô (Batch Fetching) trong file `application.yml`. Hibernate sẽ chuyển $N$ câu truy vấn đơn lẻ thành 1 câu truy vấn gom nhóm `WHERE id IN (?, ?, ?, ...)`:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        # Gom nhóm nạp Lazy Collection / Association theo lô 100 phần tử
        default_batch_fetch_size: 100
        # Bật thống kê số lượng query trong môi trường Dev/UAT
        generate_statistics: false
```

---

## 3. Ma Trận Lựa Chọn Giải Pháp

| Tình Huống Sử Dụng | Giải Pháp Tối Ưu | Ưu Điểm | Nhược Điểm |
| :--- | :--- | :--- | :--- |
| Cần lấy Entity đầy đủ để cập nhật (Mutation) | **`JOIN FETCH`** | 1 query duy nhất, Entity ở trạng thái Managed. | Có thể sinh tích Descartes nếu fetch nhiều collection. |
| Muốn tái sử dụng method tìm kiếm của Spring Data | **`@EntityGraph`** | Không cần viết JPQL thủ công, cú pháp ngắn gọn. | Cần cấu hình chính xác tên thuộc tính. |
| Chỉ đọc dữ liệu để trả API Response (Read-Only) | **DTO Projections** | Nhanh nhất, tốn ít RAM, không có overhead của Hibernate. | Không thể dùng để gọi `save()` cập nhật ngược lại. |
| Dự án lớn có nhiều quan hệ Lazy phức tạp | **Batch Fetch Size** | Hoạt động tự động trên toàn hệ thống mà không cần sửa code. | Vẫn phát sinh 2 query thay vì 1 query. |

---

## 4. Kỹ Thuật Giám Sát & Phát Hiện N+1 Query

### Cấu Hình Bật Log Hibernate Trong Môi Trường Dev/UAT:
```yaml
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

---

## 5. Bảng Kiểm Định Trước Khi Hoàn Tất Code (Quality Gate)

| STT | Câu Hỏi Kiểm Định | Đạt Chuẩn |
| :---: | :--- | :---: |
| 1 | Mọi quan hệ `@OneToMany`, `@ManyToOne`, `@ManyToMany` đã để `fetch = FetchType.LAZY` mặc định chưa? | ĐẠT |
| 2 | Khi duyệt vòng lặp Entity, đã dùng `JOIN FETCH` hoặc `@EntityGraph` để lấy quan hệ con chưa? | ĐẠT |
| 3 | Các API Read-Only (Dashboard, List, Export) đã chuyển sang dùng DTO Projections chưa? | ĐẠT |
| 4 | Cấu hình `hibernate.default_batch_fetch_size: 100` đã được bật trong `application.yml` chưa? | ĐẠT |
| 5 | Đã kiểm tra số lượng câu SQL sinh ra trong 1 request trên console log chưa (Target: 1 - 3 queries/request)? | ĐẠT |
