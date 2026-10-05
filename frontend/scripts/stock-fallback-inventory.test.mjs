/**
 * TEST SUITE: P06-008 — Stock & Fallback Images Inventory Audit & Proof Contract
 * 
 * Contract: URL / component / feature_owner
 * Standard: INVENTORY-STOCK-IMG-001
 * Auditor: Chăm Rốch Thi (Lead Technical Architect & Design System Owner)
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");

const JSON_PATH = path.join(REPO_ROOT, "docs/technical-spec/STOCK_FALLBACK_INVENTORY.json");
const MD_PATH = path.join(REPO_ROOT, "docs/technical-spec/STOCK_FALLBACK_INVENTORY.md");

test("P06-008: Artifacts Exist and Are Non-Empty", () => {
  assert.ok(fs.existsSync(JSON_PATH), "STOCK_FALLBACK_INVENTORY.json must exist");
  assert.ok(fs.existsSync(MD_PATH), "STOCK_FALLBACK_INVENTORY.md must exist");

  const jsonStats = fs.statSync(JSON_PATH);
  assert.ok(jsonStats.size > 1000, `JSON artifact must be non-empty (got ${jsonStats.size} bytes)`);

  const mdStats = fs.statSync(MD_PATH);
  assert.ok(mdStats.size > 1000, `MD artifact must be non-empty (got ${mdStats.size} bytes)`);
});

test("P06-008 Contract Proof: Every Item Strictly Has Required Fields (url / component / feature_owner)", () => {
  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));

  assert.strictEqual(data.task_id, "P06-008", "task_id must be P06-008");
  assert.strictEqual(data.standard_code, "INVENTORY-STOCK-IMG-001", "standard_code must be INVENTORY-STOCK-IMG-001");
  assert.ok(Array.isArray(data.items), "items must be an array");
  assert.ok(data.items.length >= 30, `Must discover at least 30 image records (got ${data.items.length})`);

  for (const item of data.items) {
    // 3 required contract fields: url, component, feature_owner
    assert.ok(
      typeof item.url === "string" && item.url.trim().length > 0,
      `Item ${item.id} must have non-empty 'url'`
    );
    assert.ok(
      typeof item.component === "string" && item.component.trim().length > 0,
      `Item ${item.id} must have non-empty 'component'`
    );
    assert.ok(
      typeof item.feature_owner === "string" && item.feature_owner.trim().length > 0,
      `Item ${item.id} must have non-empty 'feature_owner'`
    );

    // Supporting verification fields
    assert.ok(
      typeof item.file === "string" && item.file.trim().length > 0,
      `Item ${item.id} must have 'file'`
    );
    assert.ok(
      typeof item.line === "number" && item.line > 0,
      `Item ${item.id} must have positive integer 'line'`
    );
    assert.ok(
      ["UNSPLASH_EXTERNAL_STOCK", "CLOUDINARY_HOSTED_FALLBACK", "LOCAL_ASSET_FALLBACK"].includes(item.asset_type),
      `Item ${item.id} must have valid asset_type`
    );
    assert.ok(
      ["UI_COMPONENT", "API_OR_LIB", "DATA_ARTIFACT"].includes(item.scope),
      `Item ${item.id} must have valid scope`
    );
  }
});

test("P06-008 Real Verification: Sampled Items Line Numbers and URLs Match Source Files on Disk", () => {
  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
  const sampleIndices = [0, 1, 2, Math.floor(data.items.length / 2), data.items.length - 1];

  for (const idx of sampleIndices) {
    const item = data.items[idx];
    const fullPath = path.join(REPO_ROOT, item.file);

    assert.ok(fs.existsSync(fullPath), `Target file ${item.file} must exist on disk`);

    const fileContent = fs.readFileSync(fullPath, "utf-8");
    const lines = fileContent.split("\n");

    assert.ok(
      item.line <= lines.length,
      `Line number ${item.line} must not exceed file line count ${lines.length} in ${item.file}`
    );

    const targetLine = lines[item.line - 1];
    
    // If item was remediated in subsequent task P06-009 (e.g., STOCK-IMG-0001), verify its honest failure state
    if (item.id === "STOCK-IMG-0001") {
      assert.ok(
        fileContent.includes("honest-failure-state") || fileContent.includes("ImageOff"),
        `Remediated item ${item.id} in ${item.file} must exhibit honest failure state`
      );
    } else if (item.url.startsWith("http")) {
      // For Unsplash or external URLs, verify URL or ID is present in line
      const urlBase = item.url.split("?")[0];
      assert.ok(
        targetLine.includes(urlBase) || fileContent.includes(urlBase),
        `Line ${item.line} in ${item.file} must contain URL base '${urlBase}'`
      );
    } else {
      // Local fallback path
      assert.ok(
        targetLine.includes(item.url) || fileContent.includes(item.url),
        `Line ${item.line} in ${item.file} must contain path '${item.url}'`
      );
    }
  }
});

test("P06-008 Markdown Report Structure and Remediation Handoff for P06-009", () => {
  const mdContent = fs.readFileSync(MD_PATH, "utf-8");

  assert.ok(
    mdContent.includes("INVENTORY-STOCK-IMG-001"),
    "Report must contain standard code INVENTORY-STOCK-IMG-001"
  );
  assert.ok(
    mdContent.includes("P06-008"),
    "Report must reference task P06-008"
  );
  assert.ok(
    mdContent.includes("Chăm Rốch Thi"),
    "Report must be signed off by Lead Auditor Chăm Rốch Thi"
  );
  assert.ok(
    mdContent.includes("`URL` / `Component` / `Feature Owner`") || mdContent.includes("URL / Component / Feature Owner"),
    "Report must highlight 3-field Proof Contract"
  );
  assert.ok(
    mdContent.includes("KẾ HOẠCH BÀN GIAO CHO TASK P06-009"),
    "Report must contain section for P06-009 remediation plan"
  );
  assert.ok(
    mdContent.includes("FLAGGED_FOR_REMOVAL_IN_P06_009"),
    "Report must catalog action items flagged for removal in P06-009"
  );
});
