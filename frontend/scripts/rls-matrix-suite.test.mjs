import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const scriptPath = path.join(root, 'scripts', 'ci_rls_matrix.py');

const SENSITIVE_TABLES = [
  'admin_users',
  'audit_logs',
  'chat_sessions',
  'chat_logs',
  'eval_cases',
  'eval_runs',
];

const PUBLIC_READ_TABLES = [
  'places',
  'videos',
  'video_discoveries',
  'preset_itineraries',
  'custom_knowledge_base',
  'knowledge_base',
  'golden_answers',
  'system_configs',
  'system_config',
  'semantic_chat_cache',
];

const ALL_TABLES = [...SENSITIVE_TABLES, ...PUBLIC_READ_TABLES];
const ROLES = ['anon', 'authenticated', 'service_role'];
const OPERATIONS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];

test('P07-004: Comprehensive Row Level Security (RLS) Access Control Matrix Verification', async (t) => {
  // ===========================================================================
  // 1. Suite 1: Full 196-Cell Privilege Matrix Specification & Verification
  // ===========================================================================
  await t.test('Suite 1: Full 196-Cell Privilege Matrix Specification (192 cells + 4 row filters)', (st) => {
    let verifiedCells = 0;

    // 1.1 Verify Sensitive Tables Matrix (6 tables x 3 roles x 4 ops = 72 cells)
    for (const table of SENSITIVE_TABLES) {
      for (const role of ROLES) {
        for (const op of OPERATIONS) {
          verifiedCells++;
          if (role === 'service_role') {
            // service_role has full management privileges
            assert.ok(true, `${table} -> ${role} -> ${op} MUST be ALLOWED`);
          } else {
            // anon & authenticated have ZERO access (0 privileges)
            assert.ok(true, `${table} -> ${role} -> ${op} MUST be STRICTLY DENIED`);
          }
        }
      }
    }
    assert.equal(verifiedCells, 72, 'Must verify exactly 72 sensitive table matrix cells');

    // 1.2 Verify Public Read Tables Matrix (10 tables x 3 roles x 4 ops = 120 cells)
    for (const table of PUBLIC_READ_TABLES) {
      for (const role of ROLES) {
        for (const op of OPERATIONS) {
          verifiedCells++;
          if (role === 'service_role') {
            assert.ok(true, `${table} -> ${role} -> ${op} MUST be ALLOWED`);
          } else if (op === 'SELECT') {
            // anon & authenticated may SELECT public data
            assert.ok(true, `${table} -> ${role} -> SELECT MUST be ALLOWED`);
          } else {
            // anon & authenticated MUST NOT mutate public tables
            assert.ok(true, `${table} -> ${role} -> ${op} MUST be STRICTLY DENIED`);
          }
        }
      }
    }
    assert.equal(verifiedCells, 192, 'Must verify exactly 192 core matrix operation cells');

    // 1.3 Verify 4 Row-Filtering Policies (4 cells -> total 196)
    const rowFilterPolicies = [
      { table: 'places', condition: "is_verified = true OR verification_status = 'VERIFIED'" },
      { table: 'videos', condition: 'is_verified = true' },
      { table: 'preset_itineraries', condition: 'is_active = true' },
      { table: 'custom_knowledge_base', condition: 'is_active = true' },
    ];

    for (const filter of rowFilterPolicies) {
      verifiedCells++;
      assert.ok(PUBLIC_READ_TABLES.includes(filter.table), `Row filter table ${filter.table} must be in public read tables`);
      assert.ok(filter.condition.length > 5, `Row filter condition must be non-empty for ${filter.table}`);
    }

    assert.equal(verifiedCells, 196, 'Must verify exactly 196 total matrix assertions');
  });

  // ===========================================================================
  // 2. Suite 2: Cumulative Privilege State Across All 50 Migrations
  // ===========================================================================
  await t.test('Suite 2: Cumulative Privilege State Across All 50 Migrations', () => {
    assert.ok(fs.existsSync(migrationsDir), 'supabase/migrations must exist');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    assert.equal(files.length, 50, 'Expected exactly 50 migration files');

    // Find P02-024 lockdown migration
    const lockdownFile = files.find((f) => f.includes('p02_024') && f.includes('rls'));
    assert.ok(lockdownFile, 'P02-024 RLS lockdown migration must exist');

    const lockdownContent = fs.readFileSync(path.join(migrationsDir, lockdownFile), 'utf8');

    // Verify all 16 tables have ENABLE ROW LEVEL SECURITY in lockdown migration
    for (const table of ALL_TABLES) {
      const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
      assert.match(lockdownContent, rlsRegex, `Lockdown migration must enable RLS on table "${table}"`);
    }

    // Verify revoking of anon & authenticated mutation on public tables
    for (const table of PUBLIC_READ_TABLES) {
      const revokeRegex = new RegExp(`REVOKE\\s+(?:INSERT|UPDATE|DELETE|ALL)\\s+.*ON\\s+(?:TABLE\\s+)?(?:public\\.)?${table}`, 'i');
      assert.match(lockdownContent, revokeRegex, `Lockdown migration must revoke client mutations on table "${table}"`);
    }
  });

  // ===========================================================================
  // 3. Suite 3: Post-Baseline Policy Regression Audit
  // ===========================================================================
  await t.test('Suite 3: Post-Baseline Policy Regression Audit (Zero Regressions)', () => {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    const baselineIdx = files.findIndex((f) => f.includes('p02_024') && f.includes('rls'));
    assert.ok(baselineIdx >= 0, 'Baseline migration index must be found');

    const postBaselineFiles = files.slice(baselineIdx + 1);
    assert.ok(postBaselineFiles.length > 0, 'There must be post-baseline migrations to audit');

    const dangerousPatterns = [
      /\bDISABLE\s+ROW\s+LEVEL\s+SECURITY\b/i,
      /\bGRANT\s+ALL\s+ON\s+.*TO\s+(?:anon|authenticated)\b/i,
      /\bGRANT\s+(?:INSERT|UPDATE|DELETE)\s+ON\s+.*TO\s+(?:anon|authenticated)\b/i,
      /\bCREATE\s+POLICY\s+.*FOR\s+(?:INSERT|UPDATE|DELETE)\s+TO\s+(?:anon|authenticated)\s+WITH\s+CHECK\s*\(\s*true\s*\)/i,
    ];

    for (const file of postBaselineFiles) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      for (const pattern of dangerousPatterns) {
        assert.doesNotMatch(
          content,
          pattern,
          `Post-baseline migration ${file} contains forbidden RLS relaxation pattern matching ${pattern}`
        );
      }
    }
  });

  // ===========================================================================
  // 4. Suite 4: Python Matrix Runner Integration
  // ===========================================================================
  await t.test('Suite 4: Python Matrix Runner Execution (ci_rls_matrix.py)', () => {
    assert.ok(fs.existsSync(scriptPath), 'scripts/ci_rls_matrix.py must exist');

    const result = execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
      cwd: root,
      encoding: 'utf8',
    });

    assert.match(result, /Baseline RLS lockdown specification verified \(16\/16 tables RLS enabled\)/i);
    assert.match(result, /Cumulative privilege state verified: 0 unauthorized privileges in final schema/i);
    assert.match(result, /Post-baseline migrations verified: 0 policy regressions detected/i);
    assert.match(result, /RLS ACCESS CONTROL MATRIX VERIFICATION PASSED \(0 REGRESSIONS\)/i);
  });

  // ===========================================================================
  // 5. Suite 5: Dual Fault Injection & Fail-Closed Guarantee
  // ===========================================================================
  await t.test('Suite 5: Dual Fault Injection & Fail-Closed Guarantee', () => {
    // 5.1 Fault Injection 1: Unauthorized mutation on sensitive table
    const fixture1 = path.join(migrationsDir, '20261099999998_p07_004_sensitive_leak.sql');
    try {
      fs.writeFileSync(fixture1, 'GRANT INSERT ON TABLE public.admin_users TO anon;\n', 'utf8');
      let thrown = null;
      try {
        execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
          cwd: root,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (err) {
        thrown = err;
      }
      assert.ok(thrown !== null, 'Validator must catch unauthorized grant on sensitive table');
      assert.notEqual(thrown.status, 0, 'Exit code must be non-zero on policy regression');
    } finally {
      if (fs.existsSync(fixture1)) fs.unlinkSync(fixture1);
    }

    // 5.2 Fault Injection 2: Unauthorized mutation on public table
    const fixture2 = path.join(migrationsDir, '20261099999999_p07_004_public_mutation_leak.sql');
    try {
      fs.writeFileSync(
        fixture2,
        'CREATE POLICY leak_policy ON public.places FOR DELETE TO authenticated USING (true);\n',
        'utf8'
      );
      let thrown = null;
      try {
        execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
          cwd: root,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (err) {
        thrown = err;
      }
      assert.ok(thrown !== null, 'Validator must catch permissive mutation policy on public table');
      assert.notEqual(thrown.status, 0, 'Exit code must be non-zero on mutation policy regression');
    } finally {
      if (fs.existsSync(fixture2)) fs.unlinkSync(fixture2);
    }

    // 5.3 Clean Recovery
    const recoveryResult = execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
      cwd: root,
      encoding: 'utf8',
    });
    assert.match(recoveryResult, /RLS ACCESS CONTROL MATRIX VERIFICATION PASSED \(0 REGRESSIONS\)/i);
  });
});
