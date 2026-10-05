import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const clusterDataPath = path.join(root, 'frontend', 'src', 'lib', 'clusterData.ts');
const pagePath = path.join(root, 'frontend', 'src', 'app', 'page.tsx');
const culturePath = path.join(root, 'frontend', 'src', 'app', 'culture', 'page.tsx');
const guidePath = path.join(root, 'frontend', 'src', 'components', 'GuideClientPage.tsx');
const constantsPath = path.join(root, 'frontend', 'src', 'lib', 'constants.ts');
const inventoryPath = path.join(root, 'docs', 'technical-spec', 'COMMUNE_LABELS_INVENTORY.json');

// 15 Canonical Communes and Towns of Tri Ton District under Glossary G1 & RULE 02
const OFFICIAL_15_COMMUNES_G1 = [
  'Thị trấn Tri Tôn',
  'Thị trấn Ba Chúc',
  'Xã An Tức',
  'Xã Châu Lăng',
  'Xã Cô Tô',
  'Xã Lạc Quới',
  'Xã Lê Trì',
  'Xã Lương An Trà',
  'Xã Lương Phi',
  'Xã Núi Tô',
  'Xã Ô Lâm',
  'Xã Tà Đảnh',
  'Xã Tân Tuyến',
  'Xã Vĩnh Gia',
  'Xã Vĩnh Phước',
];

// Helper to validate whether all communes in a compound string belong to Glossary G1
function validateCompoundCommuneString(compoundStr) {
  // Split on commas or ampersands
  const parts = compoundStr.split(/[,&]/).map((s) => s.trim()).filter(Boolean);
  const invalid = [];
  for (const part of parts) {
    if (!OFFICIAL_15_COMMUNES_G1.includes(part)) {
      invalid.push(part);
    }
  }
  return {
    valid: invalid.length === 0,
    parts,
    invalid,
  };
}

test('P06-005 Static Code Invariant: Elimination of Abbreviated Commune Labels in UI Files', () => {
  assert.ok(fs.existsSync(clusterDataPath), 'frontend/src/lib/clusterData.ts must exist');
  assert.ok(fs.existsSync(pagePath), 'frontend/src/app/page.tsx must exist');
  assert.ok(fs.existsSync(culturePath), 'frontend/src/app/culture/page.tsx must exist');
  assert.ok(fs.existsSync(guidePath), 'frontend/src/components/GuideClientPage.tsx must exist');
  assert.ok(fs.existsSync(constantsPath), 'frontend/src/lib/constants.ts must exist');

  const clusterDataContent = fs.readFileSync(clusterDataPath, 'utf8');
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  const cultureContent = fs.readFileSync(culturePath, 'utf8');
  const guideContent = fs.readFileSync(guidePath, 'utf8');
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');

  // Must NOT contain forbidden abbreviations
  const forbiddenPatterns = [
    /TT\s+Tri\s+Tôn/,
    /TT\.\s+Tri\s+Tôn/,
    /TT\s+Ba\s+Chúc/,
    /TT\.\s+Ba\s+Chúc/,
  ];

  for (const pattern of forbiddenPatterns) {
    assert.equal(
      pattern.test(clusterDataContent),
      false,
      `clusterData.ts must NOT match forbidden abbreviation: ${pattern}`
    );
    assert.equal(
      pattern.test(pageContent),
      false,
      `page.tsx must NOT match forbidden abbreviation: ${pattern}`
    );
    assert.equal(
      pattern.test(cultureContent),
      false,
      `culture/page.tsx must NOT match forbidden abbreviation: ${pattern}`
    );
  }

  // Must contain official standardized labels
  assert.ok(clusterDataContent.includes('Thị trấn Tri Tôn'), 'clusterData.ts must contain official "Thị trấn Tri Tôn"');
  assert.ok(clusterDataContent.includes('Thị trấn Ba Chúc'), 'clusterData.ts must contain official "Thị trấn Ba Chúc"');
  assert.ok(cultureContent.includes('Thị trấn Tri Tôn'), 'culture/page.tsx must contain official "Thị trấn Tri Tôn"');
  assert.ok(guideContent.includes('Thị trấn Tri Tôn'), 'GuideClientPage.tsx must contain official "Thị trấn Tri Tôn"');
  assert.ok(constantsContent.includes('Công an Thị trấn Tri Tôn'), 'constants.ts must contain official "Công an Thị trấn Tri Tôn"');
  assert.ok(constantsContent.includes('Công an Thị trấn Ba Chúc'), 'constants.ts must contain official "Công an Thị trấn Ba Chúc"');
});

test('P06-005 Glossary G1 Compliance: 100% Administrative Units in CLUSTER_DEFS Match Official 15 Communes/Towns', async () => {
  // Import clusterData module dynamically
  const clusterModule = await import('../src/lib/clusterData.ts');
  assert.ok(clusterModule.CLUSTER_DEFS, 'clusterData must export CLUSTER_DEFS');
  assert.equal(clusterModule.CLUSTER_DEFS.length, 4, 'Must have exactly 4 geographic tourism clusters');

  for (const cluster of clusterModule.CLUSTER_DEFS) {
    assert.ok(cluster.id, 'Cluster must have an id');
    assert.ok(cluster.commune, `Cluster ${cluster.id} must declare commune`);

    const result = validateCompoundCommuneString(cluster.commune);
    assert.equal(
      result.valid,
      true,
      `Cluster ${cluster.id} contains non-standard commune labels: ${result.invalid.join(', ')}`
    );
    assert.ok(result.parts.length >= 2, `Cluster ${cluster.id} should cover at least 2 communes/towns`);
  }

  // Specific check for Cụm Cô Tô & Soài So (formerly containing "TT Tri Tôn")
  const cotoCluster = clusterModule.CLUSTER_DEFS.find((c) => c.id === 'cluster-coto');
  assert.ok(cotoCluster, 'Must find cluster-coto');
  assert.equal(
    cotoCluster.commune,
    'Xã Cô Tô, Xã Núi Tô & Thị trấn Tri Tôn',
    'cluster-coto commune label must be fully standardized according to Glossary G1'
  );
  assert.ok(
    cotoCluster.communeFilters.includes('Thị trấn Tri Tôn'),
    'cluster-coto communeFilters must include "Thị trấn Tri Tôn"'
  );
});

test('P06-005 PROOF: UI Snapshot Pass for Cluster Commune Label & Rendered JSX Fragment', async () => {
  const { CLUSTER_DEFS, renderClusterCommuneBadgeSnapshot } = await import('../src/lib/clusterData.ts');

  const cotoCluster = CLUSTER_DEFS.find((c) => c.id === 'cluster-coto');
  assert.ok(cotoCluster);

  // Exact UI String Snapshot
  const EXPECTED_COMMUNE_STRING = 'Xã Cô Tô, Xã Núi Tô & Thị trấn Tri Tôn';
  assert.equal(
    cotoCluster.commune,
    EXPECTED_COMMUNE_STRING,
    'UI Commune string snapshot must match expected standardized Glossary G1 label'
  );

  // Exact Rendered HTML/JSX DOM Fragment Snapshot
  const renderedSnapshot = renderClusterCommuneBadgeSnapshot(cotoCluster.commune);
  const EXPECTED_RENDERED_FRAGMENT =
    '<p class="text-[10px] sm:text-[11px] text-[#FAF3E7]/80 flex items-center gap-1 mt-0.5 font-body truncate">' +
    '<MapPin class="w-3 h-3 text-[#0E8C7F] shrink-0" />' +
    '<span class="truncate">Xã Cô Tô, Xã Núi Tô & Thị trấn Tri Tôn</span>' +
    '</p>';

  assert.equal(
    renderedSnapshot,
    EXPECTED_RENDERED_FRAGMENT,
    'Rendered UI snapshot fragment must match canonical JSX markup snapshot 100%'
  );

  // Complete Cluster Card Snapshot Invariant
  const EXPECTED_CLUSTER_CARD_SNAPSHOT = {
    id: 'cluster-coto',
    name: 'Cụm Cô Tô & Soài So',
    commune: 'Xã Cô Tô, Xã Núi Tô & Thị trấn Tri Tôn',
    badge: 'Trekking & Săn Mây',
    desc: 'Đỉnh Núi Cô Tô 614m, Đá Vồ Hội, Suối Vàng Soài So, Hồ Soài So, Chùa Sà Lôn.',
    link: '/places?cluster=cluster-coto',
    communeFilters: ['Cô Tô', 'Thị trấn Tri Tôn'],
  };

  assert.equal(cotoCluster.id, EXPECTED_CLUSTER_CARD_SNAPSHOT.id);
  assert.equal(cotoCluster.name, EXPECTED_CLUSTER_CARD_SNAPSHOT.name);
  assert.equal(cotoCluster.commune, EXPECTED_CLUSTER_CARD_SNAPSHOT.commune);
  assert.equal(cotoCluster.badge, EXPECTED_CLUSTER_CARD_SNAPSHOT.badge);
  assert.equal(cotoCluster.desc, EXPECTED_CLUSTER_CARD_SNAPSHOT.desc);
  assert.equal(cotoCluster.link, EXPECTED_CLUSTER_CARD_SNAPSHOT.link);
  assert.deepEqual(cotoCluster.communeFilters, EXPECTED_CLUSTER_CARD_SNAPSHOT.communeFilters);
});

test('P06-005 Negative Fault Injection: Non-Standard / Abbreviated Commune Labels Fail Validation', () => {
  // Case 1: Abbreviated label "TT Tri Tôn"
  const badAbbr = 'Xã Cô Tô, Xã Núi Tô & TT Tri Tôn';
  const res1 = validateCompoundCommuneString(badAbbr);
  assert.equal(res1.valid, false, 'Abbreviated label must fail validation');
  assert.deepEqual(res1.invalid, ['TT Tri Tôn']);

  // Case 2: Missing prefix "Cô Tô & Tri Tôn"
  const badPrefix = 'Cô Tô & Tri Tôn';
  const res2 = validateCompoundCommuneString(badPrefix);
  assert.equal(res2.valid, false, 'Missing prefix must fail validation');
  assert.deepEqual(res2.invalid, ['Cô Tô', 'Tri Tôn']);

  // Case 3: Out-of-district commune "Xã An Hảo" (belongs to Tinh Bien)
  const badDistrict = 'Xã Núi Tô & Xã An Hảo';
  const res3 = validateCompoundCommuneString(badDistrict);
  assert.equal(res3.valid, false, 'Out-of-district commune must fail validation');
  assert.deepEqual(res3.invalid, ['Xã An Hảo']);
});

test('P06-005 Audit Concordance: Verification against P06-004 Inventory Record', () => {
  assert.ok(fs.existsSync(inventoryPath), 'COMMUNE_LABELS_INVENTORY.json must exist');
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

  // Locate the audit record for page.tsx cluster-coto
  const targetAuditRecord = inventory.labels.find(
    (item) => item.file === 'frontend/src/app/page.tsx' && item.current_label === 'TT Tri Tôn'
  );

  assert.ok(targetAuditRecord, 'Audit record for page.tsx TT Tri Tôn must exist in inventory');
  assert.equal(targetAuditRecord.glossary_status, 'ABBREVIATION');
  assert.equal(targetAuditRecord.official_target, 'Thị trấn Tri Tôn');

  // Verify that the code has indeed been aligned with official_target
  const pageCode = fs.readFileSync(pagePath, 'utf8');
  assert.equal(
    pageCode.includes('TT Tri Tôn'),
    false,
    'page.tsx must no longer contain the audited abbreviation'
  );
  assert.ok(
    pageCode.includes('Thị trấn Tri Tôn') ||
      fs.readFileSync(clusterDataPath, 'utf8').includes('Thị trấn Tri Tôn'),
    'Repository must now use official_target: "Thị trấn Tri Tôn"'
  );
});
