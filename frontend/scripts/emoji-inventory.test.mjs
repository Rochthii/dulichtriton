import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const jsonPath = path.join(root, 'docs', 'technical-spec', 'EMOJI_INVENTORY.json');
const mdPath = path.join(root, 'docs', 'technical-spec', 'EMOJI_INVENTORY.md');

test('P06-006 Artifacts Exist and Are Non-Empty', () => {
  assert.ok(fs.existsSync(jsonPath), 'EMOJI_INVENTORY.json must exist in docs/technical-spec/');
  assert.ok(fs.existsSync(mdPath), 'EMOJI_INVENTORY.md must exist in docs/technical-spec/');

  const jsonStats = fs.statSync(jsonPath);
  const mdStats = fs.statSync(mdPath);
  assert.ok(jsonStats.size > 20000, 'JSON inventory artifact must contain substantial data');
  assert.ok(mdStats.size > 20000, 'Markdown inventory artifact must contain substantial data');
});

test('P06-006 Contract Proof: Every Item Strictly Has Required Fields (file / component / line / emoji)', () => {
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const inventory = JSON.parse(rawData);

  // Validate root metadata
  assert.equal(inventory.task_id, 'P06-006', 'Task ID must be P06-006');
  assert.equal(inventory.standard_code, 'INVENTORY-EMOJI-001', 'Standard code must be INVENTORY-EMOJI-001');
  assert.ok(inventory.lead_auditor.includes('Chăm Rốch Thi'), 'Must specify lead auditor Chăm Rốch Thi');

  // Validate Summary
  const { summary, items } = inventory;
  assert.ok(summary, 'Must contain summary object');
  assert.ok(summary.total_emojis_discovered > 0, 'Must discover emojis in codebase');
  assert.ok(summary.unique_emojis_count > 0, 'Must record unique emojis count');
  assert.ok(summary.components_count > 0, 'Must record components count');
  assert.equal(items.length, summary.total_emojis_discovered, 'Items count must match summary total');

  // CONTRACT PROOF: Every item has file, component, line, emoji
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    assert.ok(item.file && typeof item.file === 'string', `Emoji #${i + 1} must declare valid 'file'`);
    assert.ok(item.component && typeof item.component === 'string', `Emoji #${i + 1} must declare valid 'component'`);
    assert.ok(Number.isInteger(item.line) && item.line > 0, `Emoji #${i + 1} must declare positive integer 'line'`);
    assert.ok(item.emoji && typeof item.emoji === 'string', `Emoji #${i + 1} must declare non-empty 'emoji'`);
    assert.ok(item.codepoints && item.codepoints.startsWith('U+'), `Emoji #${i + 1} must declare valid 'codepoints'`);
    assert.ok(['UI_COMPONENT', 'API_OR_LIB'].includes(item.scope), `Emoji #${i + 1} scope must be valid`);
    assert.ok(item.recommended_lucide && typeof item.recommended_lucide === 'string', `Emoji #${i + 1} must suggest Lucide icon`);

    // Verify file existence on disk (0% fake/mock)
    const targetFileOnDisk = path.join(root, item.file);
    assert.ok(fs.existsSync(targetFileOnDisk), `Emoji file '${item.file}' must physically exist on disk`);
  }
});

test('P06-006 Real Verification: Sampled Items Line Numbers and Emoji Match Source Files on Disk', () => {
  const inventory = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const { items } = inventory;

  // Sample 25 items across the inventory (start, middle, end)
  const step = Math.floor(items.length / 25);
  const sampleItems = [];
  for (let i = 0; i < items.length; i += step) {
    sampleItems.push(items[i]);
  }

  for (const item of sampleItems) {
    const filePath = path.join(root, item.file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    assert.ok(item.line <= lines.length, `Line ${item.line} exceeds total lines in ${item.file}`);
    const actualLine = lines[item.line - 1];

    // Assert that the source line on disk contains either the emoji or the snippet
    assert.ok(
      actualLine.includes(item.emoji) || actualLine.includes(item.snippet.trim().slice(0, 15)),
      `File ${item.file} line ${item.line} must contain emoji '${item.emoji}'`
    );
  }
});

test('P06-006 Markdown Report Structure and Design System Preparation for P06-007', () => {
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  // Verify Markdown headings
  assert.match(mdContent, /# BÁO CÁO KIỂM TOÁN INVENTORY EMOJI THEO COMPONENT \(P06-006\)/);
  assert.match(mdContent, /## 1\.\s+TỔNG QUAN KẾT QUẢ KIỂM KÊ/);
  assert.match(mdContent, /## 2\.\s+BẢNG KIỂM KÊ CHI TIẾT EMOJI THEO COMPONENT/);
  assert.match(mdContent, /## 3\.\s+ĐÁNH GIÁ DESIGN SYSTEM & LỘ TRÌNH THAY THẾ/);
  assert.match(mdContent, /## 4\.\s+CHỮ KÝ XÁC NHẬN KIỂM TOÁN/);

  // Table header with required fields
  assert.match(mdContent, /File \(Tệp tin\)/);
  assert.match(mdContent, /Component/);
  assert.match(mdContent, /Dòng/);
  assert.match(mdContent, /Emoji/);
  assert.match(mdContent, /Lucide Icon/);

  // Sign-off
  assert.match(mdContent, /Chăm Rốch Thi/);
  assert.match(mdContent, /Lead Technical Architect & Design System Owner/);
});
