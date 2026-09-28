---
name: safe-git-rebase
description: Quy trình Git Rebase chuẩn mực, an toàn tuyệt đối (Fail-Safe Git Rebase Flow). Hướng dẫn đồng bộ code từ origin/main hoặc origin/uat vào nhánh feature bằng Rebase, xử lý conflict, hủy khẩn cấp và push an toàn với --force-with-lease.
allowed-tools: [Read, Grep, Glob, Bash]
---

<!-- GENERATED FROM 02-codestyle/safe-git-rebase/SKILL.md — DO NOT EDIT DIRECTLY -->

<!-- GENERATED FROM .shared/skills/02-codestyle/safe-git-rebase/SKILL.md — DO NOT EDIT DIRECTLY -->

# Quy Trình Git Rebase An Toàn Tuyệt Đối (Fail-Safe Git Rebase Flow)

Tài liệu này cung cấp quy trình chuẩn hóa từng bước để thực hiện `git rebase` cập nhật mã nguồn mới nhất từ nhánh `origin/main` (hoặc `origin/uat`) vào nhánh tính năng (`feature/...`), đảm bảo lịch sử commit thẳng tắp (Linear History), tránh commit merge rác và **bảo toàn 100% an toàn dữ liệu**.

---

## 🛑 3 Quy Tắc Vàng Sống Còn (The Golden Rules of Rebase)

> [!CAUTION]
> 1. **CHỈ Rebase trên nhánh cá nhân (`feature/...` / `agent/...`):** Tuyệt đối **KHÔNG BAO GIỜ** rebase trên các nhánh dùng chung (`main`, `uat`, `master`).
> 2. **LUÔN tạo nhánh Backup trước khi rebase:** Đảm bảo có đường lui khẩn cấp trong mọi tình huống.
> 3. **LUÔN dùng `--force-with-lease` khi push:** Tuyệt đối không dùng `git push -f` mù quáng để tránh vô tình ghi đè code của đồng nghiệp.

---

## 🔄 Quy Trình 6 Bước Rebase Chuẩn Mực

```text
              (Code mới của đồng nghiệp trên main)
origin/main:   A --- B --- C --- D
                                  \
feature (Sau rebase):              E' --- F' (Commit của bạn nằm trên đỉnh)
```

---

### Bước 1: Đảm bảo Working Tree sạch sẽ
Trước khi rebase, toàn bộ thay đổi phải được commit hoặc stash:
```bash
git status
# Nếu còn file đang sửa dở:
git stash save "temp-wip-before-rebase"
```

---

### Bước 2: Tạo nhánh Backup phòng hộ (Bắt buộc)
```bash
# Cú pháp: git branch backup-<tên-nhánh>-<ngày>
git branch backup-feature-branch
```

---

### Bước 3: Lấy dữ liệu mới nhất từ remote
```bash
git fetch origin main
```

---

### Bước 4: Thực hiện Rebase lên `origin/main`
```bash
git rebase origin/main
```

#### Tình huống A: Thành công mượt mà (Không có conflict)
Git hiển thị: `Successfully rebased and updated refs/heads/feature/...`  
-> Chuyển thẳng sang **Bước 5**.

#### Tình huống B: Bị xung đột mã nguồn (Conflict)
1. Mở file conflict trên IDE, chọn code đúng (`Accept Current Change` hoặc `Accept Incoming Change` hoặc kết hợp).
2. Đánh dấu file đã giải quyết conflict:
   ```bash
   git add <đường_dẫn_file_đã_sửa>
   ```
3. Tiếp tục rebase:
   ```bash
   git rebase --continue
   ```

> [!IMPORTANT]
> **CẢNH BÁO:** Khi giải quyết conflict trong quá trình rebase, **TUYỆT ĐỐI KHÔNG gõ `git commit`**. Chỉ dùng `git add` rồi `git rebase --continue`.

---

### Bước 5: Kiểm tra chất lượng sau Rebase
Trước khi push, kiểm tra xem code có bị lỗi cú pháp hay hỏng test không:
```bash
./gradlew test # hoặc mvn test
```

---

### Bước 6: Đẩy code lên Remote an toàn (`--force-with-lease`)
```bash
git push origin <tên-nhánh-feature> --force-with-lease
```

---

## 🆘 Cẩm Nang Cứu Hộ Khẩn Cấp (Disaster Recovery)

### Cách 1: Hủy ngay lệnh Rebase đang chạy dở
```bash
git rebase --abort
```
*(Mọi thứ lập tức hoàn nguyên 100% về trước khi rebase).*

---

### Cách 2: Khôi phục từ nhánh Backup đã tạo ở Bước 2
```bash
git reset --hard backup-feature-branch
```

---

### Cách 3: Hồi sinh bằng `git reflog`
```bash
git reflog
# Tìm dòng trước khi rebase (ví dụ: HEAD@{3})
git reset --hard HEAD@{3}
```
