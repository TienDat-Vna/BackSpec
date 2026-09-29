const fs = require("fs");
const path = require("path");
const ui = require("../ui");
const { ensureDir, findSpecDir } = require("../utils/file-system");

async function runClarify(featureName, options = {}) {
  const root = path.resolve(options.cwd || process.cwd());

  if (!featureName) {
    ui.error("Vui lòng cung cấp tên spec. Ví dụ: specify clarify create-order");
    process.exit(1);
  }

  const specDir = findSpecDir(root, featureName);
  const specFile = path.join(specDir, "SPEC.md");
  const clarifyFile = path.join(specDir, "CLARIFICATIONS.md");

  if (!fs.existsSync(specFile)) {
    ui.error(`Không tìm thấy SPEC.md tại ${path.relative(root, specDir)}`);
    process.exit(1);
  }

  const specContent = fs.readFileSync(specFile, "utf8");
  const questions = [];

  if (!specContent.includes("Idempotency")) {
    questions.push({
      topic: "Idempotency & Race Conditions",
      question: "API này có cần hỗ trợ header 'Idempotency-Key' với Redis TTL 24h không?",
      recommendation: "BẮT BUỘC nếu là endpoint tạo mới, thanh toán hoặc đổi trạng thái quan trọng.",
    });
  }

  if (!specContent.includes("RFC 7807") && !specContent.includes("Error Matrix")) {
    questions.push({
      topic: "Error Handling Standard",
      question: "Các mã lỗi nghiệp vụ cụ thể (400, 404, 409, 422) đã được định nghĩa theo chuẩn RFC 7807 chưa?",
      recommendation: "Cần bổ sung bảng Error Matrix với format { type, title, detail, code }.",
    });
  }

  if (!specContent.includes("Soft Delete") && !specContent.includes("is_deleted")) {
    questions.push({
      topic: "Data Deletion & Audit",
      question: "Thao tác xóa dữ liệu sẽ thực hiện theo cơ chế Soft Delete (is_deleted = true) chứ?",
      recommendation: "TUYỆT ĐỐI KHÔNG Hard Delete theo Hiến pháp CONSTITUTION §2.",
    });
  }

  if (!specContent.includes("Circuit Breaker") && !specContent.includes("Timeout")) {
    questions.push({
      topic: "Distributed Resilience",
      question: "Các cuộc gọi phụ thuộc (HTTP/gRPC/Kafka) có timeout <= 3000ms và Circuit Breaker không?",
      recommendation: "Bắt buộc cấu hình Circuit Breaker để tránh sập dây chuyền.",
    });
  }

  const date = new Date().toISOString().split("T")[0];
  let clarifyContent = `# [CLARIFICATIONS] ${path.basename(specDir)}\n\n> **Ngày phân tích:** ${date} | **Trạng thái:** ${questions.length === 0 ? "🟢 ALL RESOLVED" : "🟡 PENDING REVIEW"}\n\n---\n\n`;

  if (questions.length === 0) {
    clarifyContent += `### ✅ Không phát hiện điểm mơ hồ lớn\nĐặc tả kỹ thuật \`SPEC.md\` đã tuân thủ đầy đủ các tiêu chuẩn kiến trúc cốt lõi.\n`;
  } else {
    clarifyContent += `### 🔍 Các điểm cần làm rõ trước khi lập trình:\n\n`;
    questions.forEach((q, idx) => {
      clarifyContent += `#### ${idx + 1}. ${q.topic}\n- **Câu hỏi:** ${q.question}\n- **Khuyến nghị:** ${q.recommendation}\n- **Quyết định:** _[Tech Lead / Dev ghi nhận tại đây]_\n\n`;
    });
  }

  fs.writeFileSync(clarifyFile, clarifyContent, "utf8");

  ui.success(`Đã tạo bảng phân tích làm rõ: ${ui.pc.cyan(path.relative(root, clarifyFile))}`);
  ui.box("💡 SPEC-KIT CLARIFICATION REPORT", [
    `Spec Name        : ${path.basename(specDir)}`,
    `Điểm mơ hồ       : ${questions.length} vấn đề cần lưu ý`,
    `File ghi nhận    : ${path.relative(root, clarifyFile)}`,
    `Trạng thái       : ${questions.length === 0 ? ui.pc.green("SẴN SÀNG TRIỂN KHAI") : ui.pc.yellow("CẦN XÁC NHẬN")}`,
  ]);

  if (questions.length > 0) {
    console.log("\n" + ui.pc.bold(ui.pc.yellow("Các điểm cần chú ý:")));
    questions.forEach((q, i) => {
      console.log(`  ${i + 1}. ${ui.pc.bold(q.topic)}: ${q.question}`);
    });
  }
}

module.exports = {
  runClarify,
};
