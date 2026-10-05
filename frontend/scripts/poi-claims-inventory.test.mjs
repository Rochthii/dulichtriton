import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const jsonPath = path.join(root, 'docs', 'technical-spec', 'POI_CLAIMS_INVENTORY.json');
const mdPath = path.join(root, 'docs', 'technical-spec', 'POI_CLAIMS_INVENTORY.md');

test('P06-001 Artifacts Exist and Are Non-Empty', () => {
  assert.ok(fs.existsSync(jsonPath), 'POI_CLAIMS_INVENTORY.json must exist in docs/technical-spec/');
  assert.ok(fs.existsSync(mdPath), 'POI_CLAIMS_INVENTORY.md must exist in docs/technical-spec/');

  const jsonStats = fs.statSync(jsonPath);
  const mdStats = fs.statSync(mdPath);
  assert.ok(jsonStats.size > 1000, 'JSON inventory artifact must contain substantial data');
  assert.ok(mdStats.size > 1000, 'Markdown inventory artifact must contain substantial data');
});

test('P06-001 Contract Proof: Every Claim Has Required Fields (file/line/current claim/source)', () => {
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const inventory = JSON.parse(rawData);

  // Validate root metadata
  assert.equal(inventory.task_id, 'P06-001', 'Task ID must be P06-001');
  assert.equal(inventory.standard_code, 'INVENTORY-POI-CLAIMS-001');
  assert.ok(inventory.lead_auditor, 'Must specify lead auditor');
  assert.ok(inventory.generated_at, 'Must specify generated timestamp');

  // Validate Summary
  const { summary, claims } = inventory;
  assert.ok(summary, 'Must contain summary');
  assert.ok(summary.total_claims_discovered > 0, 'Must discover claims in codebase');
  assert.ok(summary.ui_claims_count > 0, 'Must discover claims in UI components');
  assert.ok(summary.doc_claims_count > 0, 'Must discover claims in documentation');
  assert.equal(
    summary.total_claims_discovered,
    summary.ui_claims_count + summary.doc_claims_count,
    'Total claims must equal UI claims + Docs claims'
  );
  assert.equal(claims.length, summary.total_claims_discovered, 'Claims array length must match summary');

  // CONTRACT PROOF: file / line / current claim / source
  for (let i = 0; i < claims.length; i++) {
    const item = claims[i];
    assert.ok(item.file && typeof item.file === 'string', `Claim #${i + 1} must have valid 'file' string`);
    assert.ok(Number.isInteger(item.line) && item.line > 0, `Claim #${i + 1} must have positive integer 'line'`);
    assert.ok(item.current_claim && typeof item.current_claim === 'string', `Claim #${i + 1} must have non-empty 'current_claim'`);
    assert.ok(item.source && typeof item.source === 'string', `Claim #${i + 1} must have non-empty 'source'`);

    // Verify scope contract
    assert.ok(['UI', 'DOCS'].includes(item.scope), `Claim #${i + 1} scope must be either UI or DOCS`);

    // Verify real file existence on disk (0% fake/mock)
    const targetFileOnDisk = path.join(root, item.file);
    assert.ok(fs.existsSync(targetFileOnDisk), `Claim file '${item.file}' must physically exist in repository`);
  }
});

test('P06-001 Real Verification: Sampled Claims Line Numbers and Content Match Source Files', () => {
  const inventory = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const { claims } = inventory;

  // Verify UI and Docs coverage
  const uiClaims = claims.filter(c => c.scope === 'UI');
  const docClaims = claims.filter(c => c.scope === 'DOCS');
  assert.ok(uiClaims.length >= 10, 'Expected at least 10 UI claims');
  assert.ok(docClaims.length >= 10, 'Expected at least 10 Docs claims');

  // Spot-check first 10 and last 10 claims to verify file contents line integrity
  const sampledClaims = [...claims.slice(0, 10), ...claims.slice(-10)];
  for (const item of sampledClaims) {
    const filePath = path.join(root, item.file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    assert.ok(item.line <= lines.length, `Line ${item.line} exceeds total lines in ${item.file}`);
    const actualLine = lines[item.line - 1];
    assert.ok(
      actualLine.toLowerCase().includes(item.current_claim.toLowerCase()) ||
      actualLine.includes(item.snippet.trim().slice(0, 15)),
      `File ${item.file} line ${item.line} must contain reference to claim '${item.current_claim}'`
    );
  }
});

test('P06-001 Markdown Report Structure and Audit Sign-Off', () => {
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  // Verify Markdown headings and tables
  assert.match(mdContent, /# BÁO CÁO KIỂM TOÁN DANH MỤC CLAIM SỐ LƯỢNG POI TRÊN UI & TÀI LIỆU \(P06-001\)/);
  assert.match(mdContent, /## 1\.\s+TỔNG QUAN KẾT QUẢ KIỂM KÊ/);
  assert.match(mdContent, /## 2\.\s+BẢNG KIỂM KÊ CHI TIẾT CÁC CLAIM/);
  assert.match(mdContent, /## 3\.\s+PHÂN TÍCH ĐỘ LỆCH SO VỚI CANONICAL MANIFEST/);
  assert.match(mdContent, /## 4\.\s+CHỮ KÝ XÁC NHẬN KIỂM TOÁN/);

  // Table header with required fields
  assert.match(mdContent, /File \(Tệp tin\)/);
  assert.match(mdContent, /Line \(Dòng\)/);
  assert.match(mdContent, /Current Claim \(Tuyên bố hiện tại\)/);
  assert.match(mdContent, /Source \/ Context \(Nguồn & Ngữ cảnh\)/);

  // Sign-off
  assert.match(mdContent, /Chăm Rốch Thi/);
  assert.match(mdContent, /Lead Technical Architect & Local Cultural Auditor/);
});
