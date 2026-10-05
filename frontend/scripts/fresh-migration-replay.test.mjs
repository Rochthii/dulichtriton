import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const scriptPath = path.join(root, 'scripts', 'ci_migration_replay.py');
const workflowPath = path.join(root, '.github', 'workflows', 'ci.yml');

test('P07-003: Fresh Migration Replay & Blank Database Build Verification', async (t) => {
  // ===========================================================================
  // 1. Proof 1: Migration Inventory, Encoding & Monotonic Chronology
  // ===========================================================================
  await t.test('Proof 1: Migration Inventory & Monotonic Chronology', () => {
    assert.ok(fs.existsSync(migrationsDir), 'supabase/migrations directory must exist');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));

    assert.equal(files.length, 50, `Expected exactly 50 migration files, found ${files.length}`);

    let prevFile = '';
    for (const file of files.sort()) {
      // Must match 8+ digits timestamp prefix
      const match = file.match(/^(\d{8})/);
      assert.ok(match, `${file} must start with an 8+ digit timestamp`);

      // Must be non-empty and valid UTF-8
      const fullPath = path.join(migrationsDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.ok(content.trim().length > 10, `${file} must not be empty`);

      // Dollar-quoting balance check ($$ count must be even)
      const dollarMatches = content.match(/\$\$/g) || [];
      assert.equal(
        dollarMatches.length % 2,
        0,
        `${file} has unbalanced PL/pgSQL dollar quotes: count=${dollarMatches.length}`
      );

      // Monotonic filename sequence check (standard migration runner sort order)
      if (prevFile) {
        assert.ok(
          file >= prevFile,
          `Migrations must be chronological: ${file} < previous ${prevFile}`
        );
      }
      prevFile = file;
    }
  });

  // ===========================================================================
  // 2. Proof 2: Blank Database Replay Simulation & Schema Dependency Graph
  // ===========================================================================
  await t.test('Proof 2: Blank Database Replay Simulation & Dependency Graph', () => {
    // Blank state tracker starting with 0 objects
    const state = {
      extensions: new Set(),
      tables: new Map(), // tableName -> { columns: Set, constraints: Set, rlsEnabled: boolean }
      functions: new Set(),
      roles: new Set(['anon', 'authenticated', 'service_role']),
    };

    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      // 1. Track CREATE EXTENSION
      const extMatches = content.matchAll(/CREATE\s+EXTENSION\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?([a-zA-Z0-9_-]+)["']?/gi);
      for (const m of extMatches) {
        state.extensions.add(m[1].toLowerCase());
      }

      // 2. Track CREATE TABLE
      const tableMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi);
      for (const m of tableMatches) {
        const tableName = m[1].toLowerCase();
        if (!state.tables.has(tableName)) {
          state.tables.set(tableName, {
            columns: new Set(),
            constraints: new Set(),
            rlsEnabled: false,
          });
        }
        const body = m[2];
        const lines = body.split('\n');
        for (const line of lines) {
          const colMatch = line.trim().match(/^([a-zA-Z0-9_]+)\s+/);
          if (colMatch && !['constraint', 'primary', 'foreign', 'unique', 'check'].includes(colMatch[1].toLowerCase())) {
            state.tables.get(tableName).columns.add(colMatch[1].toLowerCase());
          }
        }
      }

      // 3. Track ALTER TABLE ... ADD COLUMN (supports multiple comma-separated ADD COLUMN clauses)
      const alterTableBlocks = content.matchAll(/ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+([\s\S]*?);/gi);
      for (const block of alterTableBlocks) {
        const tableName = block[1].toLowerCase();
        const clauses = block[2];
        const addColMatches = clauses.matchAll(/ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi);
        for (const m of addColMatches) {
          const colName = m[1].toLowerCase();
          if (state.tables.has(tableName)) {
            state.tables.get(tableName).columns.add(colName);
          }
        }
      }

      // 4. Track ENABLE ROW LEVEL SECURITY
      const rlsMatches = content.matchAll(/ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi);
      for (const m of rlsMatches) {
        const tableName = m[1].toLowerCase();
        if (state.tables.has(tableName)) {
          state.tables.get(tableName).rlsEnabled = true;
        }
      }

      // 5. Track Functions
      const fnMatches = content.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-zA-Z0-9_]+)/gi);
      for (const m of fnMatches) {
        state.functions.add(m[1].toLowerCase());
      }

      // 6. Track Constraints
      const checkMatches = content.matchAll(/CONSTRAINT\s+([a-zA-Z0-9_]+)\s+CHECK/gi);
      for (const m of checkMatches) {
        if (state.tables.has('places')) {
          state.tables.get('places').constraints.add(m[1].toLowerCase());
        }
      }
    }

    // Verify Extensions after replay
    const requiredExtensions = ['uuid-ossp', 'pgcrypto', 'vector', 'postgis', 'unaccent', 'pg_trgm'];
    for (const ext of requiredExtensions) {
      assert.ok(state.extensions.has(ext), `Extension "${ext}" must be enabled after migration replay`);
    }

    // Verify Core Tables after replay
    const coreTables = [
      'places',
      'admin_users',
      'preset_itineraries',
      'videos',
      'video_discoveries',
      'audit_logs',
      'chat_sessions',
      'chat_logs',
      'golden_answers',
      'eval_cases',
      'system_configs',
      'knowledge_base',
      'custom_knowledge_base',
      'semantic_chat_cache',
    ];

    for (const tName of coreTables) {
      assert.ok(state.tables.has(tName), `Core table "${tName}" must exist after replay`);
      const tInfo = state.tables.get(tName);
      assert.equal(tInfo.rlsEnabled, true, `Table "${tName}" must have Row Level Security ENABLED`);
      assert.ok(tInfo.columns.size > 0, `Table "${tName}" must have defined columns`);
    }

    // Verify Places core columns & constraints
    const placesColumns = state.tables.get('places').columns;
    const requiredPlacesCols = [
      'id', 'name', 'latitude', 'longitude', 'rating',
      'category', 'address', 'description', 'image_url', 'photos',
      'is_verified', 'verification_status',
    ];
    for (const col of requiredPlacesCols) {
      assert.ok(placesColumns.has(col), `places must have column "${col}"`);
    }

    // Verify Admin Users core columns
    const adminColumns = state.tables.get('admin_users').columns;
    const requiredAdminCols = [
      'id', 'email', 'role', 'is_active', 'password_hash', 'session_hash',
    ];
    for (const col of requiredAdminCols) {
      assert.ok(adminColumns.has(col), `admin_users must have column "${col}"`);
    }

    // Verify Chat Logs columns (model_used, latency_ms)
    const chatLogColumns = state.tables.get('chat_logs').columns;
    assert.ok(chatLogColumns.has('model_used'), 'chat_logs must have "model_used"');
    assert.ok(chatLogColumns.has('latency_ms'), 'chat_logs must have "latency_ms"');

    // Verify Core Functions
    const requiredFunctions = [
      'match_places_nearby',
      'match_places',
      'cleanup_expired_chat_sessions',
      'cleanup_expired_chat_logs',
    ];
    for (const fn of requiredFunctions) {
      assert.ok(state.functions.has(fn), `Function "${fn}" must exist after replay`);
    }
  });

  // ===========================================================================
  // 3. Proof 3: Python Migration Runner & Static AST Syntax Check
  // ===========================================================================
  await t.test('Proof 3: Python Runner Validation (0 Errors)', () => {
    assert.ok(fs.existsSync(scriptPath), 'scripts/ci_migration_replay.py must exist');

    const result = execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
      cwd: root,
      encoding: 'utf8',
    });

    assert.match(
      result,
      /Step 1 PASSED: All 50 migration files passed structural and syntax validation/i,
      'Python validator must confirm all 50 migration files pass'
    );
    assert.match(
      result,
      /CI Migration verification completed successfully with 0 errors/i,
      'Python validator must terminate with 0 errors'
    );
  });

  // ===========================================================================
  // 4. Proof 4: CI Workflow Replay Job Declaration
  // ===========================================================================
  await t.test('Proof 4: CI Workflow Replay Job Invariant', () => {
    assert.ok(fs.existsSync(workflowPath), '.github/workflows/ci.yml must exist');
    const content = fs.readFileSync(workflowPath, 'utf8');

    assert.match(content, /migration-replay:\s*\n\s*name:\s*Migration Replay & Validation/);
    assert.match(content, /services:\s*\n\s*postgres:/);
    assert.match(content, /image:\s*pgvector\/pgvector:pg16/);
    assert.match(content, /python scripts\/ci_migration_replay\.py/);
  });

  // ===========================================================================
  // 5. Proof 5: Fault Injection Invariant (Fail-Closed Replay Guarantee)
  // ===========================================================================
  await t.test('Proof 5: Fault Injection Invariant (Fail-Closed Replay Guarantee)', () => {
    // 5.1 Injected Syntax Error
    const syntaxFixture = path.join(migrationsDir, '99999999_p07_003_syntax_fail.sql');
    try {
      fs.writeFileSync(syntaxFixture, 'CREATE TABEL bad_syntax_table (id INT);\n', 'utf8');
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
      assert.ok(thrown !== null, 'Validator must fail when invalid SQL syntax is injected');
      assert.notEqual(thrown.status, 0, 'Exit code must be non-zero on syntax defect');
    } finally {
      if (fs.existsSync(syntaxFixture)) fs.unlinkSync(syntaxFixture);
    }

    // 5.2 Injected Dollar Quote Mismatch
    const quoteFixture = path.join(migrationsDir, '99999999_p07_003_quote_fail.sql');
    try {
      fs.writeFileSync(quoteFixture, 'DO $$ BEGIN SELECT 1; END; -- Unbalanced\n', 'utf8');
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
      assert.ok(thrown !== null, 'Validator must fail when unbalanced dollar-quotes are injected');
      assert.notEqual(thrown.status, 0, 'Exit code must be non-zero on unbalanced quotes');
    } finally {
      if (fs.existsSync(quoteFixture)) fs.unlinkSync(quoteFixture);
    }

    // 5.3 Clean Recovery
    const recoveryResult = execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
      cwd: root,
      encoding: 'utf8',
    });
    assert.match(recoveryResult, /completed successfully with 0 errors/i);
  });
});
