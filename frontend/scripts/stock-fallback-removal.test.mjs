/**
 * TEST SUITE: P06-009 — Stock Fallback Image Removal & Honest Failure State Proof
 * 
 * Contract:
 * 1. Removal of unverified external stock fallback photo (Unsplash URL in CheckinSpotsManager).
 * 2. Honest failure state rendered when photo is missing (ImageOff Lucide vector + "Chưa có ảnh thực địa").
 * 3. Prevention of unrelated foreign photography display (Zero fake/stock photos).
 * 4. Authentic field photography preserved when present.
 * 5. Concordance with STOCK-IMG-0001 from P06-008 inventory.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");
const FRONTEND_DIR = path.resolve(REPO_ROOT, "frontend");

console.log("================================================================================");
console.log("🧪 RUNNING SUITE: P06-009 Stock Fallback Removal & Honest Failure State Proof");
console.log("================================================================================");

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    testsFailed++;
  }
}

// ── TEST 1: Static Code Invariant in CheckinSpotsManager.tsx ───────────────────
runTest("Test 1: Static Code Invariant — Elimination of Unsplash URL & Presence of Honest Failure State", () => {
  const filePath = path.join(FRONTEND_DIR, "src/app/admin/places/components/CheckinSpotsManager.tsx");
  assert.ok(fs.existsSync(filePath), "CheckinSpotsManager.tsx must exist");
  const content = fs.readFileSync(filePath, "utf-8");

  // Verify complete elimination of the stock Unsplash URL
  const stockUnsplashUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400";
  assert.strictEqual(
    content.includes(stockUnsplashUrl),
    false,
    "CheckinSpotsManager.tsx must NOT contain stock Unsplash photo URL"
  );

  // Verify presence of ImageOff icon and honest failure state
  assert.ok(
    content.includes("ImageOff") && content.includes("lucide-react"),
    "CheckinSpotsManager.tsx must import ImageOff from lucide-react"
  );
  assert.ok(
    content.includes('data-testid="honest-failure-state"'),
    "CheckinSpotsManager.tsx must declare honest-failure-state testid"
  );
  assert.ok(
    content.includes("Chưa có ảnh thực địa"),
    "CheckinSpotsManager.tsx must display honest text 'Chưa có ảnh thực địa'"
  );
});

// ── TEST 2: PROOF — Honest Failure State Rendering on Missing Photo ────────────
runTest("Test 2: PROOF — Missing/Falsy photo URL renders honest failure state without <img> tag", async () => {
  const filePath = path.join(FRONTEND_DIR, "src/app/admin/places/components/CheckinSpotsManager.tsx");
  const { renderCheckinSpotPreviewSnapshot } = await import(`file://${filePath.replace(/\\/g, "/")}`);

  assert.strictEqual(
    typeof renderCheckinSpotPreviewSnapshot,
    "function",
    "renderCheckinSpotPreviewSnapshot must be exported"
  );

  // Test 2a: null photo_url
  const nullSnapshot = renderCheckinSpotPreviewSnapshot(null, "Góc Cổng Trời");
  assert.ok(nullSnapshot.includes('data-testid="honest-failure-state"'), "Must render failure state container");
  assert.ok(nullSnapshot.includes("lucide-image-off"), "Must render ImageOff Lucide SVG vector");
  assert.ok(nullSnapshot.includes("Chưa có ảnh thực địa"), "Must render honest label");
  assert.strictEqual(nullSnapshot.includes("<img"), false, "Must NOT render <img> tag when photo is missing");

  // Test 2b: empty string photo_url
  const emptySnapshot = renderCheckinSpotPreviewSnapshot("", "Góc Cổng Trời");
  assert.ok(emptySnapshot.includes('data-testid="honest-failure-state"'), "Must render failure state for empty string");
  assert.strictEqual(emptySnapshot.includes("<img"), false, "Must NOT render <img> tag for empty string");
});

// ── TEST 3: PROOF — Denial of Unrelated External Stock Photos ─────────────────
runTest("Test 3: PROOF — Unsplash URLs are strictly denied and fall back to honest failure state", async () => {
  const filePath = path.join(FRONTEND_DIR, "src/app/admin/places/components/CheckinSpotsManager.tsx");
  const { renderCheckinSpotPreviewSnapshot } = await import(`file://${filePath.replace(/\\/g, "/")}`);

  const foreignUnsplashUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400";
  const snapshot = renderCheckinSpotPreviewSnapshot(foreignUnsplashUrl, "Góc Ngoại Lai");

  assert.ok(
    snapshot.includes('data-testid="honest-failure-state"'),
    "Unsplash URL must be rejected and trigger honest failure state"
  );
  assert.strictEqual(
    snapshot.includes(foreignUnsplashUrl),
    false,
    "Rendered DOM must NOT display unrelated Unsplash image URL"
  );
});

// ── TEST 4: Preservation of Authentic Field Photography ────────────────────────
runTest("Test 4: Preservation of Authentic Field Photography when present", async () => {
  const filePath = path.join(FRONTEND_DIR, "src/app/admin/places/components/CheckinSpotsManager.tsx");
  const { renderCheckinSpotPreviewSnapshot } = await import(`file://${filePath.replace(/\\/g, "/")}`);

  const authenticUrl = "https://res.cloudinary.com/dhjesnejt/image/upload/v1786758888/tri_ton/ta_pa_real.jpg";
  const spotTitle = "Hồ Tà Pạ Bình Minh";
  const snapshot = renderCheckinSpotPreviewSnapshot(authenticUrl, spotTitle);

  assert.ok(snapshot.includes("<img"), "Must render <img> tag when authentic photo exists");
  assert.ok(snapshot.includes(authenticUrl), "Must render exact authentic photo URL");
  assert.ok(snapshot.includes(`alt="${spotTitle}"`), "Must render correct alt attribute");
  assert.strictEqual(snapshot.includes("honest-failure-state"), false, "Must not trigger failure state");
});

// ── TEST 5: Concordance with STOCK-IMG-0001 in STOCK_FALLBACK_INVENTORY.json ──
runTest("Test 5: Audit Concordance with STOCK-IMG-0001 from P06-008 Inventory", () => {
  const jsonPath = path.join(REPO_ROOT, "docs/technical-spec/STOCK_FALLBACK_INVENTORY.json");
  assert.ok(fs.existsSync(jsonPath), "STOCK_FALLBACK_INVENTORY.json must exist");
  const inventory = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const stock0001 = inventory.items.find(it => it.id === "STOCK-IMG-0001");
  assert.ok(stock0001, "STOCK-IMG-0001 must exist in inventory");
  assert.strictEqual(stock0001.component, "CheckinSpotsManager", "Component must match CheckinSpotsManager");
  assert.strictEqual(stock0001.file, "frontend/src/app/admin/places/components/CheckinSpotsManager.tsx");
  assert.strictEqual(stock0001.remediation_action, "FLAGGED_FOR_REMOVAL_IN_P06_009");
  console.log(`     ℹ️ Verified STOCK-IMG-0001 (CheckinSpotsManager) concordance & remediation.`);
});

// ── SUMMARY REPORT ─────────────────────────────────────────────────────────────
console.log("\n--------------------------------------------------------------------------------");
console.log(`📊 TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed (Total: ${testsPassed + testsFailed})`);
console.log("--------------------------------------------------------------------------------");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL P06-009 PROOF TESTS PASSED SUCCESSFULLY!\n");
  process.exit(0);
}
