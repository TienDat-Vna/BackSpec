# [TASKS] BackSpec Trust Reset

## Phase 1 — Canonical project model

- [x] T1. Tạo Project Layout v2 resolver.
- [x] T2. Tạo Project Health Inspector có rule ID, severity và evidence.

## Phase 2 — Trustworthy commands

- [x] T3. Refactor `doctor`, `validate`, `status` dùng chung health snapshot.
- [x] T4. Hoàn thiện `sync --check` không ghi file và phát hiện drift.
- [x] T5. Đồng bộ version banner với `package.json`.

## Phase 3 — Safe writes

- [x] T6. Thêm atomic safe write và conflict protection.
- [x] T7. Áp dụng bảo vệ cho spec/plan/tasks và CLI flags.

## Phase 4 — Verification

- [x] T8. Chuyển test suite sang temporary fixture cô lập.
- [x] T9. Thêm contract assertions cho init/doctor/validate/status/safe write.
- [x] T10. Chạy test, CLI smoke, diff check và cập nhật changelog/spec status.
