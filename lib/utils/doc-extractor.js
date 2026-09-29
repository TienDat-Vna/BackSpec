const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

/**
 * Trích xuất nội dung từ file Word (.docx)
 * @param {string} filePath - Đường dẫn tới file docx
 * @returns {Promise<{ text: string, html: string, markdown: string, tables: string[], headings: string[] }>}
 */
async function parseDocx(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File không tồn tại: ${filePath}`);
  }

  const rawResult = await mammoth.extractRawText({ path: filePath });
  const rawText = rawResult.value;

  const htmlResult = await mammoth.convertToHtml({ path: filePath });
  const html = htmlResult.value;

  // Simple HTML to Markdown conversion for headings, lists and tables
  let markdown = html
    .replace(/<h1>(.*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2>(.*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3>(.*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<h4>(.*?)<\/h4>/gi, "\n#### $1\n")
    .replace(/<p><strong>(.*?)<\/strong><\/p>/gi, "\n**$1**\n")
    .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<ul>|<\/ul>|<ol>|<\/ol>/gi, "")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Extract headings
  const headings = [];
  const headingMatches = markdown.match(/^#{1,4}\s+.+$/gm) || [];
  for (const h of headingMatches) {
    headings.push(h.replace(/^#{1,4}\s+/, "").trim());
  }

  // Extract tables from HTML
  const tables = [];
  const tableRegex = /<table>([\s\S]*?)<\/table>/gi;
  let match;
  while ((match = tableRegex.exec(html)) !== null) {
    tables.push(match[1]);
  }

  return {
    rawText,
    html,
    markdown: markdown.trim(),
    headings,
    tableCount: tables.length,
  };
}

/**
 * Phân tích metadata và chuẩn bị ngữ cảnh phân tích cho file ảnh (.png, .jpg, .jpeg)
 * @param {string} filePath - Đường dẫn tới file ảnh
 * @returns {Promise<{ filePath: string, fileName: string, fileType: string, sizeBytes: number, isImage: boolean, promptGuidance: string }>}
 */
async function parseImage(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ảnh không tồn tại: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);

  return {
    filePath,
    fileName,
    fileType: ext.replace(".", ""),
    sizeBytes: stat.size,
    isImage: true,
    promptGuidance: `Ảnh ${fileName} (${(stat.size / 1024).toFixed(1)} KB): Sơ đồ kiến trúc / ERD / Sequence / UI Wireframe đầu vào của dự án.`,
  };
}

/**
 * Trích xuất toàn bộ tài liệu đầu vào (hỗ trợ .docx, .png, .jpg, .md, .txt hoặc cả folder)
 * @param {string} inputPath - Đường dẫn file hoặc folder tài liệu
 * @returns {Promise<{ docxFiles: any[], imageFiles: any[], textFiles: any[], combinedMarkdown: string, summary: string }>}
 */
async function ingestInput(inputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Đường dẫn tài liệu không tồn tại: ${inputPath}`);
  }

  const stat = fs.statSync(inputPath);
  const docxFiles = [];
  const imageFiles = [];
  const textFiles = [];

  const filesToProcess = [];

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(inputPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        filesToProcess.push(path.join(inputPath, entry.name));
      }
    }
  } else {
    filesToProcess.push(inputPath);
  }

  const markdownParts = [];

  for (const file of filesToProcess) {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file);

    if (ext === ".docx") {
      try {
        const docxData = await parseDocx(file);
        docxFiles.push({ file: base, fullPath: file, ...docxData });
        markdownParts.push(`\n## 📄 TÀI LIỆU GỐC TỪ WORD: ${base}\n\n${docxData.markdown}\n`);
      } catch (err) {
        markdownParts.push(`\n<!-- Lỗi đọc file ${base}: ${err.message} -->\n`);
      }
    } else if ([".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(ext)) {
      try {
        const imgData = await parseImage(file);
        imageFiles.push(imgData);
        markdownParts.push(`\n## 🖼️ SƠ ĐỒ / HÌNH ẢNH ĐẦU VÀO: ${base}\n- **Đường dẫn:** \`${file}\`\n- **Mô tả:** ${imgData.promptGuidance}\n`);
      } catch (err) {
        markdownParts.push(`\n<!-- Lỗi đọc ảnh ${base}: ${err.message} -->\n`);
      }
    } else if ([".md", ".txt", ".json", ".yaml", ".yml"].includes(ext)) {
      const content = fs.readFileSync(file, "utf8");
      textFiles.push({ file: base, fullPath: file, content });
      markdownParts.push(`\n## 📋 TÀI LIỆU VĂN BẢN: ${base}\n\n${content}\n`);
    }
  }

  const summary = `Đã nạp ${docxFiles.length} file Word (.docx), ${imageFiles.length} sơ đồ ảnh (.png/.jpg), ${textFiles.length} file văn bản.`;

  return {
    docxFiles,
    imageFiles,
    textFiles,
    combinedMarkdown: markdownParts.join("\n---\n"),
    summary,
  };
}

module.exports = {
  parseDocx,
  parseImage,
  ingestInput,
};
