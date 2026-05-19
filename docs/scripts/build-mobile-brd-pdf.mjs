#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { marked } from "marked";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, "..");
const ROOT = path.resolve(DOCS_DIR, "..");
const INPUT_MD = path.join(DOCS_DIR, "STOS_MOBILE_APPS_BRD.md");
const OUT_DIR = path.join(DOCS_DIR, "dist", "brd-pdf");
const DIAGRAMS_DIR = path.join(OUT_DIR, "diagrams");
const OUTPUT_PDF = path.join(DOCS_DIR, "STOS_MOBILE_APPS_BRD.pdf");
const MERMAID_CONFIG = path.join(__dirname, "mermaid-theme.json");

const BRAND = { navy: "#1E3066", orange: "#F58220", green: "#22C55E", bg: "#F8F9FA", text: "#1A1A1A", muted: "#64748B" };

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function findMmdc() {
  for (const base of [ROOT, DOCS_DIR]) {
    const bin = path.join(base, "node_modules", ".bin", "mmdc");
    if (fs.existsSync(bin)) return bin;
  }
  throw new Error("Install: npm install @mermaid-js/mermaid-cli puppeteer marked");
}

function extractMermaidBlocks(md) {
  const regex = /```mermaid\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  let index = 0;
  while ((match = regex.exec(md)) !== null) {
    blocks.push({
      index: index++,
      full: match[0],
      code: match[1].trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return blocks;
}

function renderMermaidDiagrams(blocks, mmdcBin) {
  ensureDir(DIAGRAMS_DIR);
  return blocks.map((block) => {
    const mmdPath = path.join(DIAGRAMS_DIR, `diagram-${block.index}.mmd`);
    const pngPath = path.join(DIAGRAMS_DIR, `diagram-${block.index}.png`);
    fs.writeFileSync(mmdPath, block.code, "utf8");
    try {
      execSync(`"${mmdcBin}" -i "${mmdPath}" -o "${pngPath}" -c "${MERMAID_CONFIG}" -b white --scale 3 -w 1280`, {
        stdio: "pipe",
        maxBuffer: 10 * 1024 * 1024,
      });
      return { block, pngPath };
    } catch (e) {
      console.warn(`Diagram ${block.index} failed:`, String(e.stderr || e.message).slice(0, 120));
      return { block, pngPath: null };
    }
  });
}

function injectDiagrams(md, rendered) {
  let result = md;
  const sorted = [...rendered].sort((a, b) => b.block.start - a.block.start);
  for (const { block, pngPath } of sorted) {
    const replacement =
      pngPath && fs.existsSync(pngPath)
        ? `\n<div class="diagram-wrap"><figure class="diagram"><img src="diagrams/diagram-${block.index}.png" alt="Hình ${block.index + 1}" /><figcaption>Hình ${block.index + 1} — Sơ đồ nghiệp vụ</figcaption></figure></div>\n`
        : `\n> *[Hình ${block.index + 1}: sơ đồ nghiệp vụ]*\n`;
    result = result.slice(0, block.start) + replacement + result.slice(block.end);
  }
  return result;
}

function buildHtml(bodyHtml) {
  const date = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<title>BRD STOS Guard & STOS Life</title>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
@page { size: A4; margin: 20mm 16mm 22mm 16mm; }
* { box-sizing: border-box; }
body { font-family: "Be Vietnam Pro", sans-serif; color: ${BRAND.text}; line-height: 1.55; margin: 0; font-size: 10.5pt; }
.cover { page-break-after: always; min-height: 250mm; padding: 40px 36px; background: linear-gradient(145deg, ${BRAND.navy}, #243d75 50%, #1a3066); color: #fff; position: relative; }
.cover-badge { display: inline-block; background: ${BRAND.orange}; padding: 6px 14px; border-radius: 4px; font-size: 9pt; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
.cover h1 { font-size: 26pt; margin: 0 0 10px; line-height: 1.2; }
.cover .subtitle { font-size: 13pt; opacity: 0.92; margin-bottom: 36px; }
.cover-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 10pt; border-top: 1px solid rgba(255,255,255,0.25); padding-top: 20px; max-width: 420px; }
.cover-meta dt { font-weight: 600; }
.cover-meta dd { margin: 0 0 10px; opacity: 0.9; }
.apps-strip { display: flex; gap: 14px; margin-top: 28px; }
.app-pill { flex: 1; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); }
.app-pill.life { border-color: ${BRAND.green}; }
.app-pill.guard { border-color: ${BRAND.orange}; }
.app-pill strong { display: block; font-size: 11pt; margin-bottom: 4px; }
.app-pill span { font-size: 9pt; opacity: 0.88; }
h1 { font-size: 18pt; color: ${BRAND.navy}; border-bottom: 3px solid ${BRAND.orange}; padding-bottom: 6px; margin: 26px 0 12px; page-break-after: avoid; }
h2 { font-size: 14pt; color: ${BRAND.navy}; margin: 22px 0 10px; page-break-after: avoid; }
h3 { font-size: 11.5pt; margin: 16px 0 8px; page-break-after: avoid; }
h4 { font-size: 10.5pt; color: ${BRAND.muted}; margin: 12px 0 6px; }
p { margin: 0 0 10px; text-align: justify; }
table { width: 100%; border-collapse: collapse; margin: 12px 0 16px; font-size: 9.5pt; page-break-inside: avoid; }
th { background: ${BRAND.navy}; color: #fff; padding: 9px 11px; text-align: left; font-weight: 600; }
td { border-bottom: 1px solid #E2E8F0; padding: 7px 11px; vertical-align: top; }
tr:nth-child(even) td { background: ${BRAND.bg}; }
blockquote { margin: 10px 0; padding: 10px 14px; border-left: 4px solid ${BRAND.orange}; background: #FFF9F3; }
hr { border: none; border-top: 1px solid #E2E8F0; margin: 20px 0; }
ul, ol { margin: 8px 0 12px; padding-left: 20px; }
li { margin-bottom: 3px; }
.diagram-wrap { page-break-inside: avoid; margin: 18px 0 22px; }
figure.diagram { margin: 0; padding: 14px; background: #FAFBFC; border: 1px solid #E2E8F0; border-radius: 10px; box-shadow: 0 2px 10px rgba(30,48,102,0.07); }
figure.diagram img { width: 100%; height: auto; display: block; }
figcaption { text-align: center; font-size: 9pt; color: ${BRAND.muted}; margin-top: 10px; font-weight: 500; }
.content > ol:first-of-type { background: ${BRAND.bg}; padding: 18px 18px 18px 32px; border-radius: 8px; border: 1px solid #E2E8F0; page-break-after: always; }
.doc-footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #E2E8F0; font-size: 8.5pt; color: ${BRAND.muted}; text-align: center; }
</style>
</head>
<body>
<section class="cover">
<span class="cover-badge">Business Requirements Document</span>
<h1>Hai Phân Hệ Ứng Dụng Di Động STOS</h1>
<p class="subtitle">STOS Life · STOS Guard</p>
<dl class="cover-meta">
<dt>Phiên bản</dt><dd>1.0</dd>
<dt>Ngày phát hành</dt><dd>${date}</dd>
<dt>Trạng thái</dt><dd>Draft</dd>
<dt>Phạm vi</dt><dd>Hai app mobile — Cư dân & Bảo vệ</dd>
</dl>
<div class="apps-strip">
<div class="app-pill life"><strong>STOS Life</strong><span>Có việc gì, cứ gọi anh!</span></div>
<div class="app-pill guard"><strong>STOS Guard</strong><span>Đơn giản — Dùng được mọi nơi</span></div>
</div>
</section>
<main class="content">${bodyHtml}<div class="doc-footer">STOS — Hệ Điều Hành Chung Cư · Tài liệu nội bộ · ${date}</div></main>
</body></html>`;
}

async function generatePdf(htmlPath, pdfPath) {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 120000 });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;width:100%;padding:0 16mm;color:#64748B;font-family:sans-serif;display:flex;justify-content:space-between;"><span>STOS Mobile Apps BRD v1.0</span><span>SecuriTech</span></div>`,
    footerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#64748B;padding:0 16mm;">Trang <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    margin: { top: "18mm", bottom: "20mm", left: "0", right: "0" },
  });
  await browser.close();
}

async function main() {
  console.log("▶ Reading", INPUT_MD);
  let md = fs.readFileSync(INPUT_MD, "utf8");
  md = md.replace(/\]\(\.\/STOS_BRD\.md\)/g, "]").replace(/\[([^\]]+)\]\(#[^)]+\)/g, "$1");

  const mmdcBin = findMmdc();
  const blocks = extractMermaidBlocks(md);
  console.log(`▶ Rendering ${blocks.length} Mermaid diagrams...`);
  const rendered = renderMermaidDiagrams(blocks, mmdcBin);
  md = injectDiagrams(md, rendered);

  console.log("▶ Building HTML...");
  ensureDir(OUT_DIR);
  const bodyHtml = marked.parse(md);
  const html = buildHtml(bodyHtml);
  const htmlPath = path.join(OUT_DIR, "STOS_MOBILE_APPS_BRD.html");
  fs.writeFileSync(htmlPath, html, "utf8");

  console.log("▶ Generating PDF...");
  await generatePdf(htmlPath, OUTPUT_PDF);
  const stat = fs.statSync(OUTPUT_PDF);
  console.log(`✔ PDF ready: ${OUTPUT_PDF} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
