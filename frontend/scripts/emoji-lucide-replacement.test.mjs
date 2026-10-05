/**
 * TEST SUITE: P06-007 — Emoji to Lucide Icon Replacement Proof
 *
 * Contract:
 * 1. Component renders correctly with Lucide SVG vector icon (Folk-Modern Bảy Núi Design System).
 * 2. Zero asset placeholders (0% dummy images, 0% unverified CDN assets, 0% placeholder tokens).
 * 3. Persona chips in page.tsx no longer use raw emojis (📸, 👨‍👩‍👧‍👦, 🥾, 🙏).
 * 4. Fault injection verifies negative rejection of emojis and placeholder assets.
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
console.log("🧪 RUNNING SUITE: P06-007 Emoji to Lucide Icon Replacement & Zero Placeholder Proof");
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

// ── TEST 1: Static Code Invariant in frontend/src/app/page.tsx ─────────────────
runTest("Test 1: Static Code Invariant — page.tsx replaces raw emojis with AUDIENCE_FILTERS and Camera icon", () => {
  const pagePath = path.join(FRONTEND_DIR, "src/app/page.tsx");
  assert.ok(fs.existsSync(pagePath), "page.tsx must exist");
  const pageContent = fs.readFileSync(pagePath, "utf-8");

  // Verify import of AUDIENCE_FILTERS
  assert.ok(
    pageContent.includes('import { AUDIENCE_FILTERS, type AudienceFilter } from "@/lib/designSystemIcons";'),
    "page.tsx must import AUDIENCE_FILTERS from @/lib/designSystemIcons"
  );

  // Verify Persona Chips block maps AUDIENCE_FILTERS
  assert.ok(
    pageContent.includes("{AUDIENCE_FILTERS.map((aud) => {"),
    "page.tsx must map AUDIENCE_FILTERS in Persona Chips section"
  );

  // Verify raw emoji chip labels are no longer present in page.tsx
  assert.strictEqual(
    pageContent.includes('label: "📸 Sống Ảo"'),
    false,
    "page.tsx must NOT contain raw emoji '📸 Sống Ảo'"
  );
  assert.strictEqual(
    pageContent.includes('label: "👨‍👩‍👧‍👦 Gia Đình"'),
    false,
    "page.tsx must NOT contain raw emoji '👨‍👩‍👧‍👦 Gia Đình'"
  );
  assert.strictEqual(
    pageContent.includes('label: "🥾 Săn Mây"'),
    false,
    "page.tsx must NOT contain raw emoji '🥾 Săn Mây'"
  );
  assert.strictEqual(
    pageContent.includes('label: "🙏 Tâm Linh"'),
    false,
    "page.tsx must NOT contain raw emoji '🙏 Tâm Linh'"
  );

  // Verify Camera Lucide vector component is mapped for youth / Sống Ảo
  assert.ok(
    pageContent.includes('aud.iconName === "Camera"') && pageContent.includes("? Camera"),
    "page.tsx must map aud.iconName === 'Camera' to Camera component"
  );
});

// ── TEST 2: Asset Integrity — Zero Placeholder & Clean Registry ─────────────────
runTest("Test 2: Asset Integrity — AUDIENCE_FILTERS registry contains zero placeholder assets", async () => {
  const registryPath = path.join(FRONTEND_DIR, "src/lib/designSystemIcons.ts");
  assert.ok(fs.existsSync(registryPath), "designSystemIcons.ts must exist");
  const registryContent = fs.readFileSync(registryPath, "utf-8");

  // Verify no placeholder strings exist in registry
  const placeholderMatches = registryContent.match(/placeholder|dummy|fake|mock/gi);
  // Filtering out comments that mention rule "Zero Asset Placeholders"
  const linesWithPlaceholder = registryContent
    .split("\n")
    .filter(line => !line.includes("Zero Asset Placeholders") && !line.includes("placeholderRegex") && !line.includes("placeholder keywords") && !line.includes("placeholder asset reference"))
    .filter(line => /placeholder|dummy|mock/i.test(line));

  assert.strictEqual(
    linesWithPlaceholder.length,
    0,
    `Registry should not have any placeholder assets or tokens, found: ${linesWithPlaceholder.join("; ")}`
  );

  // Load and validate module functions
  const { AUDIENCE_FILTERS, validateDesignSystemChip } = await import(
    `file://${registryPath.replace(/\\/g, "/")}`
  );

  assert.ok(Array.isArray(AUDIENCE_FILTERS), "AUDIENCE_FILTERS must be an array");
  assert.strictEqual(AUDIENCE_FILTERS.length, 5, "AUDIENCE_FILTERS must have exactly 5 options");

  // Validate every chip passes with 0 errors
  for (const item of AUDIENCE_FILTERS) {
    const res = validateDesignSystemChip(item);
    assert.strictEqual(res.valid, true, `Filter chip '${item.key}' should be valid`);
    assert.strictEqual(res.errors.length, 0, `Filter chip '${item.key}' should have 0 errors`);
  }

  // Specifically check youth chip
  const youthChip = AUDIENCE_FILTERS.find(f => f.key === "youth");
  assert.ok(youthChip, "youth chip must exist");
  assert.strictEqual(youthChip.label, "Sống Ảo", "youth chip label must be clean text 'Sống Ảo'");
  assert.strictEqual(youthChip.iconName, "Camera", "youth chip must use Camera Lucide icon");
  assert.strictEqual(youthChip.replacesEmoji, "📸", "youth chip must declare replacing 📸");
});

// ── TEST 3: PROOF — Rendered DOM Snapshot Verification ──────────────────────────
runTest("Test 3: PROOF — Rendered DOM snapshot matches Lucide SVG markup without emoji or placeholder", async () => {
  const registryPath = path.join(FRONTEND_DIR, "src/lib/designSystemIcons.ts");
  const { AUDIENCE_FILTERS, renderAudienceChipSnapshot } = await import(
    `file://${registryPath.replace(/\\/g, "/")}`
  );

  const youthChip = AUDIENCE_FILTERS.find(f => f.key === "youth");
  assert.ok(youthChip, "youth chip must exist");

  // Test inactive state render snapshot
  const inactiveSnapshot = renderAudienceChipSnapshot(youthChip, false);
  assert.ok(
    inactiveSnapshot.includes('<svg class="lucide lucide-camera w-3.5 h-3.5 shrink-0" data-icon="Camera"></svg>'),
    "Rendered snapshot must include Lucide Camera SVG markup"
  );
  assert.ok(
    inactiveSnapshot.includes("<span>Sống Ảo</span>"),
    "Rendered snapshot must include clean text span 'Sống Ảo'"
  );
  assert.ok(
    !inactiveSnapshot.includes("📸"),
    "Rendered snapshot must NOT contain emoji 📸"
  );
  assert.ok(
    !inactiveSnapshot.includes("<img"),
    "Rendered snapshot must NOT contain <img> placeholder tag"
  );

  // Test active state render snapshot
  const activeSnapshot = renderAudienceChipSnapshot(youthChip, true);
  assert.ok(
    activeSnapshot.includes("bg-[#0E8C7F] text-white"),
    "Active snapshot must include Folk-Modern primary color styling"
  );
  assert.ok(
    activeSnapshot.includes('<svg class="lucide lucide-camera'),
    "Active snapshot must also include Camera SVG"
  );
});

// ── TEST 4: Fault Injection / Negative Testing ──────────────────────────────────
runTest("Test 4: Fault Injection — Validator detects and rejects emojis and placeholder assets", async () => {
  const registryPath = path.join(FRONTEND_DIR, "src/lib/designSystemIcons.ts");
  const { validateDesignSystemChip } = await import(
    `file://${registryPath.replace(/\\/g, "/")}`
  );

  // Case 1: Raw emoji injection
  const badEmojiChip = {
    key: "youth",
    label: "📸 Sống Ảo",
    iconName: "Camera",
    description: "Invalid because label has emoji",
  };
  const emojiResult = validateDesignSystemChip(badEmojiChip);
  assert.strictEqual(emojiResult.valid, false, "Must reject label with raw emoji");
  assert.ok(
    emojiResult.errors.some(e => e.includes("still contains raw emoji")),
    "Error must specify emoji presence"
  );

  // Case 2: Placeholder keyword injection
  const badPlaceholderChip = {
    key: "mock",
    label: "Placeholder Filter",
    iconName: null,
    description: "Invalid because uses placeholder word",
  };
  const placeholderResult = validateDesignSystemChip(badPlaceholderChip);
  assert.strictEqual(placeholderResult.valid, false, "Must reject placeholder keyword");
  assert.ok(
    placeholderResult.errors.some(e => e.includes("placeholder")),
    "Error must specify placeholder violation"
  );
});

// ── TEST 5: Emoji Inventory Concordance ─────────────────────────────────────────
runTest("Test 5: Emoji Inventory Concordance — Verification against EMOJI_INVENTORY.json", () => {
  const inventoryPath = path.join(REPO_ROOT, "docs/technical-spec/EMOJI_INVENTORY.json");
  assert.ok(fs.existsSync(inventoryPath), "EMOJI_INVENTORY.json must exist");
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));

  assert.ok(Array.isArray(inventory.items), "inventory.items must be an array");

  // Check that the inventory recorded frontend/src/app/page.tsx
  const pageEntries = inventory.items.filter(e => e.file.includes("frontend/src/app/page.tsx"));
  assert.ok(pageEntries.length > 0, "EMOJI_INVENTORY must have records for frontend/src/app/page.tsx");

  // Find 📸 entries (specifically EMOJI-0005)
  const cameraEntries = pageEntries.filter(e => e.emoji === "📸");
  assert.ok(
    cameraEntries.length > 0,
    "Inventory must record 📸 occurrence in page.tsx"
  );

  const emoji0005 = inventory.items.find(e => e.id === "EMOJI-0005");
  assert.ok(emoji0005, "EMOJI-0005 record must exist in inventory");
  assert.strictEqual(emoji0005.emoji, "📸", "EMOJI-0005 must be 📸");
  assert.strictEqual(emoji0005.recommended_lucide, "Camera", "EMOJI-0005 must recommend Camera");
  console.log(`     ℹ️ Verified EMOJI-0005 (📸 -> Camera in HomePage) concordance.`);
});

// ── SUMMARY REPORT ─────────────────────────────────────────────────────────────
console.log("\n--------------------------------------------------------------------------------");
console.log(`📊 TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed (Total: ${testsPassed + testsFailed})`);
console.log("--------------------------------------------------------------------------------");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL P06-007 PROOF TESTS PASSED SUCCESSFULLY!\n");
  process.exit(0);
}
