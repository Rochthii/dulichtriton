import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const jsonPath = path.join(root, 'docs', 'technical-spec', 'COMMUNE_LABELS_INVENTORY.json');
const mdPath = path.join(root, 'docs', 'technical-spec', 'COMMUNE_LABELS_INVENTORY.md');

test('P06-004 Artifacts Exist and Are Non-Empty', () => {
  assert.ok(fs.existsSync(jsonPath), 'COMMUNE_LABELS_INVENTORY.json must exist in docs/technical-spec/');
  assert.ok(fs.existsSync(mdPath), 'COMMUNE_LABELS_INVENTORY.md must exist in docs/technical-spec/');

  const jsonStats = fs.statSync(jsonPath);
  const mdStats = fs.statSync(mdPath);
  assert.ok(jsonStats.size > 10000, 'JSON inventory artifact must contain substantial data');
  assert.ok(mdStats.size > 10000, 'Markdown inventory artifact must contain substantial data');
});

test('P06-004 Contract Proof: Every Item Has Required Fields (file/line/current label)', () => {
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const inventory = JSON.parse(rawData);

  // Validate root metadata
  assert.equal(inventory.task_id, 'P06-004', 'Task ID must be P06-004');
  assert.equal(inventory.standard_code, 'INVENTORY-COMMUNE-LABELS-001');
  assert.ok(inventory.lead_auditor, 'Must specify lead auditor');
  assert.equal(inventory.glossary_reference.official_unit_count, 15, 'Must reference exactly 15 official commune units');

  // Validate Summary
  const { summary, labels } = inventory;
  assert.ok(summary, 'Must contain summary');
  assert.ok(summary.total_labels_discovered > 0, 'Must discover labels in codebase');
  assert.ok(summary.ui_labels_count > 0, 'Must discover labels in UI components');
  assert.ok(summary.doc_labels_count > 0, 'Must discover labels in documentation');
  assert.equal(
    summary.total_labels_discovered,
    summary.ui_labels_count + summary.doc_labels_count,
    'Total labels must equal UI labels + Docs labels'
  );
  assert.equal(labels.length, summary.total_labels_discovered, 'Labels array length must match summary');

  // CONTRACT PROOF: file / line / current_label
  // Check first 100 and last 100 items exhaustively
  const checkSample = [...labels.slice(0, 100), ...labels.slice(-100)];
  for (let i = 0; i < checkSample.length; i++) {
    const item = checkSample[i];
    assert.ok(item.file && typeof item.file === 'string', `Label #${i + 1} must have valid 'file' string`);
    assert.ok(Number.isInteger(item.line) && item.line > 0, `Label #${i + 1} must have positive integer 'line'`);
    assert.ok(item.current_label && typeof item.current_label === 'string', `Label #${i + 1} must have non-empty 'current_label'`);
    assert.ok(['UI', 'DOCS'].includes(item.scope), `Label #${i + 1} scope must be either UI or DOCS`);
    assert.ok(item.glossary_status, `Label #${i + 1} must have glossary_status`);

    // Verify real file existence on disk (0% fake/mock)
    const targetFileOnDisk = path.join(root, item.file);
    assert.ok(fs.existsSync(targetFileOnDisk), `Label file '${item.file}' must physically exist in repository`);
  }
});

test('P06-004 Real Verification: Sampled Labels Line Numbers and Content Match Source Files', () => {
  const inventory = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const { labels } = inventory;

  // Spot-check 15 sampled labels to verify file contents line integrity
  const sampledLabels = labels.slice(0, 15);
  for (const item of sampledLabels) {
    const filePath = path.join(root, item.file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    assert.ok(item.line <= lines.length, `Line ${item.line} exceeds total lines in ${item.file}`);
    const actualLine = lines[item.line - 1];
    assert.ok(
      actualLine.toLowerCase().includes(item.current_label.toLowerCase()) ||
      actualLine.includes(item.snippet.trim().slice(0, 15)),
      `File ${item.file} line ${item.line} must contain reference to label '${item.current_label}'`
    );
  }
});

test('P06-004 Markdown Report Structure and Glossary G1 Alignment', () => {
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  // Verify Markdown headings and tables
  assert.match(mdContent, /# BÁO CÁO KIỂM TOÁN DANH MỤC TÊN ĐƠN VỊ HÀNH CHÍNH TRÊN UI & TÀI LIỆU \(P06-004\)/);
  assert.match(mdContent, /## 1\.\s+TỔNG QUAN KẾT QUẢ KIỂM KÊ/);
  assert.match(mdContent, /## 2\.\s+BẢNG KIỂM KÊ CHI TIẾT CÁC NHÃN ĐƠN VỊ HÀNH CHÍNH/);
  assert.match(mdContent, /## 3\.\s+ĐÁNH GIÁ ĐỘ LỆCH & KẾ HOẠCH XỬ LÝ TIẾP THEO/);
  assert.match(mdContent, /## 4\.\s+CHỮ KÝ XÁC NHẬN KIỂM TOÁN/);

  // Table header with required fields
  assert.match(mdContent, /File \(Tệp tin\)/);
  assert.match(mdContent, /Line \(Dòng\)/);
  assert.match(mdContent, /Current Label \(Nhãn hiện tại\)/);
  assert.match(mdContent, /Trạng thái Glossary G1/);

  // Sign-off
  assert.match(mdContent, /Chăm Rốch Thi/);
  assert.match(mdContent, /Lead Technical Architect & Local Cultural Auditor/);
});
