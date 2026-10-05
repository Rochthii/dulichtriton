import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const roadmapDocPath = path.join(root, 'docs', '11_Roadmap.md');

test('Test 1: Archived Document Exists and Contains Formal Archive Title Tag', () => {
  assert.ok(fs.existsSync(roadmapDocPath), 'docs/11_Roadmap.md must physically exist');

  const content = fs.readFileSync(roadmapDocPath, 'utf8');
  assert.match(
    content,
    /# 11\.\s+LỘ TRÌNH TRIỂN KHAI\s+\(ROADMAP\)\s+—\s+\[ARCHIVED/i,
    'Title must explicitly indicate [ARCHIVED] status'
  );
});

test('Test 2: Standard GitHub Alert Warning Banner is Present in Document Header', () => {
  const content = fs.readFileSync(roadmapDocPath, 'utf8');

  // Verify GitHub Alert Warning syntax
  assert.match(content, />\s*\[!(?:WARNING|CAUTION)\]/i, 'Must contain standard GitHub Alert Warning or Caution banner');

  // Verify explicit declaration that document is superseded and archived
  assert.match(
    content,
    /SUPERSEDED\s*&\s*ARCHIVED|ĐÃ BỊ THAY THẾ/i,
    'Banner must explicitly declare the document is superseded and archived'
  );
});

test('Test 3: Banner Contains Direct Hyperlinks to Official Authority Documents', () => {
  const content = fs.readFileSync(roadmapDocPath, 'utf8');

  // Must link to Production Remediation Plan (authority for production remediation tasks)
  assert.match(
    content,
    /\[(?:Production Remediation Plan|12_PRODUCTION_REMEDIATION_PLAN\.md)\]\(12_PRODUCTION_REMEDIATION_PLAN\.md\)/,
    'Banner must link directly to 12_PRODUCTION_REMEDIATION_PLAN.md'
  );

  // Must link to Two-Stream Execution Board (authority for operational roadmap)
  assert.match(
    content,
    /\[(?:Execution Board|Two-Stream Execution Board|13_TWO_STREAM_EXECUTION_BOARD\.md)\]\(13_TWO_STREAM_EXECUTION_BOARD\.md\)/,
    'Banner must link directly to 13_TWO_STREAM_EXECUTION_BOARD.md'
  );

  // Must link to ACTIVE_TASK.md (authority for currently active operational task)
  assert.match(
    content,
    /\[(?:ACTIVE_TASK\.md|Active Task)\]\(\.\.\/ACTIVE_TASK\.md\)/,
    'Banner must link directly to ACTIVE_TASK.md'
  );
});

test('Test 4: Zero Roadmap Contention Invariant (Deprecation of Legacy Assumptions)', () => {
  const content = fs.readFileSync(roadmapDocPath, 'utf8');

  // Must explicitly state that this document does NOT hold authority for production deployment
  assert.match(
    content,
    /(?:không còn hiệu lực|không dùng tài liệu này làm authority|tuyệt đối không dùng làm căn cứ)/i,
    'Must explicitly state document holds zero authority for production implementation'
  );

  // Must state that authority has migrated entirely to the remediation plan
  assert.match(
    content,
    /(?:chuyển giao|điều phối|authority)/i,
    'Must state that execution authority resides in remediation governance'
  );
});

test('Test 5: Physical Existence Verification for All Authority Target Files Linked in Banner', () => {
  const content = fs.readFileSync(roadmapDocPath, 'utf8');

  // Extract markdown links within the first 15 lines (the banner header area)
  const headerLines = content.split(/\r?\n/).slice(0, 15).join('\n');
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  let linksFound = 0;

  while ((match = linkRegex.exec(headerLines)) !== null) {
    const linkTarget = match[2];
    const resolvedPath = path.resolve(path.dirname(roadmapDocPath), linkTarget);
    assert.ok(
      fs.existsSync(resolvedPath),
      `Authority file linked in banner '${linkTarget}' must physically exist on disk at '${resolvedPath}'`
    );
    linksFound++;
  }

  assert.ok(linksFound >= 3, `Banner must link to at least 3 authority files (found: ${linksFound})`);
});
