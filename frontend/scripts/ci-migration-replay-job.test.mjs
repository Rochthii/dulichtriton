import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const workflowPath = path.join(root, '.github', 'workflows', 'ci.yml');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const scriptPath = path.join(root, 'scripts', 'ci_migration_replay.py');

test('CI workflow file exists and defines migration-replay job alongside build, lint, and unit-test', () => {
  assert.ok(fs.existsSync(workflowPath), '.github/workflows/ci.yml must exist');
  const content = fs.readFileSync(workflowPath, 'utf8');
  assert.ok(content.length > 50, 'Workflow file must not be empty');

  // Verify YAML syntax via Python pyyaml
  const pyCheck = `python -c "import yaml; data = yaml.safe_load(open(r'${workflowPath.replace(/\\/g, '/')}', encoding='utf-8')); assert 'jobs' in data; assert 'build' in data['jobs']; assert 'lint' in data['jobs']; assert 'unit-test' in data['jobs']; assert 'migration-replay' in data['jobs']"`;
  assert.doesNotThrow(() => {
    execSync(pyCheck, { stdio: 'pipe' });
  }, 'YAML file must be strictly valid YAML containing all 4 required jobs');
});

test('CI migration-replay job defines clean checkout, postgres service, Python 3.11, and runner script on ubuntu-latest', () => {
  const content = fs.readFileSync(workflowPath, 'utf8');

  // Verify migration-replay job attributes
  assert.match(content, /migration-replay:\s*\n\s*name:\s*Migration Replay & Validation/);
  assert.match(content, /runs-on:\s*ubuntu-latest/);
  assert.match(content, /services:\s*\n\s*postgres:/);
  assert.match(content, /image:\s*pgvector\/pgvector:pg16/);
  assert.match(content, /uses:\s*actions\/checkout@v4/);
  assert.match(content, /uses:\s*actions\/setup-python@v5/);
  assert.match(content, /python-version:\s*['"]?3\.11['"]?/);
  assert.match(content, /python scripts\/ci_migration_replay\.py/);
});

test('migrations directory contains ordered, validly-named SQL files', () => {
  assert.ok(fs.existsSync(migrationsDir), 'supabase/migrations directory must exist');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

  assert.ok(files.length >= 50, `Expected at least 50 migration files, found ${files.length}`);

  // Every file must start with timestamp digits
  for (const f of files) {
    assert.match(f, /^\d{8}/, `${f} must start with an 8+ digit timestamp`);
  }
});

test('migration replay runner script exists and validates current migrations with zero errors', () => {
  assert.ok(fs.existsSync(scriptPath), 'scripts/ci_migration_replay.py must exist');

  const result = execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
    cwd: root,
    encoding: 'utf8',
  });

  assert.match(result, /Step 1 PASSED: All \d+ migration files passed structural and syntax validation/i);
  assert.match(result, /CI Migration verification completed successfully with 0 errors/i);
});

test('FAULT INJECTION PROOF: syntax error in migration causes runner to exit with non-zero code', () => {
  const brokenFixturePath = path.join(migrationsDir, '99999999_fault_injection_broken_syntax.sql');

  try {
    // Inject invalid SQL syntax
    fs.writeFileSync(brokenFixturePath, 'CREATE TABEL broken_table_test (id INT);\n', 'utf8');

    let thrownError = null;
    try {
      execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
        cwd: root,
        encoding: 'utf8',
      });
    } catch (err) {
      thrownError = err;
    }

    assert.ok(thrownError !== null, 'Fault injection must cause migration runner to exit with non-zero code');
    assert.notEqual(thrownError.status, 0, 'Migration runner must return non-zero exit code on syntax defect');
    const output = (thrownError.stdout?.toString() || '') + (thrownError.stderr?.toString() || '');
    assert.match(output, /CREATE TABEL|FAILED/i, 'Output must report syntax failure');
  } finally {
    if (fs.existsSync(brokenFixturePath)) {
      fs.unlinkSync(brokenFixturePath);
    }
  }

  // Recovery assertion: fixture deleted, runner passes cleanly
  assert.ok(!fs.existsSync(brokenFixturePath), 'Fixture must be cleanly removed');
  const recoveryResult = execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
    cwd: root,
    encoding: 'utf8',
  });
  assert.match(recoveryResult, /completed successfully with 0 errors/i);
});

test('FAULT INJECTION PROOF: unbalanced dollar-quoting in migration causes runner to exit with non-zero code', () => {
  const unbalancedFixturePath = path.join(migrationsDir, '99999999_fault_injection_unbalanced.sql');

  try {
    // Inject unbalanced $$ dollar quotes
    fs.writeFileSync(unbalancedFixturePath, 'DO $$ BEGIN SELECT 1; END; -- Missing closing dollar\n', 'utf8');

    let thrownError = null;
    try {
      execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
        cwd: root,
        encoding: 'utf8',
      });
    } catch (err) {
      thrownError = err;
    }

    assert.ok(thrownError !== null, 'Fault injection must cause migration runner to exit with non-zero code');
    assert.notEqual(thrownError.status, 0, 'Migration runner must return non-zero exit code on unbalanced quotes');
    const output = (thrownError.stdout?.toString() || '') + (thrownError.stderr?.toString() || '');
    assert.match(output, /dollar quotes|FAILED/i, 'Output must report unbalanced quote failure');
  } finally {
    if (fs.existsSync(unbalancedFixturePath)) {
      fs.unlinkSync(unbalancedFixturePath);
    }
  }

  // Recovery assertion
  assert.ok(!fs.existsSync(unbalancedFixturePath), 'Fixture must be cleanly removed');
  const recoveryResult = execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
    cwd: root,
    encoding: 'utf8',
  });
  assert.match(recoveryResult, /completed successfully with 0 errors/i);
});
