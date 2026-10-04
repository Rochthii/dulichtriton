import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const workflowPath = path.join(root, '.github', 'workflows', 'ci.yml');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const scriptPath = path.join(root, 'scripts', 'ci_rls_matrix.py');

test('CI workflow file exists and defines rls-matrix job alongside other jobs', () => {
  assert.ok(fs.existsSync(workflowPath), '.github/workflows/ci.yml must exist');
  const content = fs.readFileSync(workflowPath, 'utf8');
  assert.ok(content.length > 50, 'Workflow file must not be empty');

  // Verify YAML syntax via Python pyyaml
  const pyCheck = `python -c "import yaml; data = yaml.safe_load(open(r'${workflowPath.replace(/\\/g, '/')}', encoding='utf-8')); assert 'jobs' in data; assert 'build' in data['jobs']; assert 'lint' in data['jobs']; assert 'unit-test' in data['jobs']; assert 'migration-replay' in data['jobs']; assert 'rls-matrix' in data['jobs']"`;
  assert.doesNotThrow(() => {
    execSync(pyCheck, { stdio: 'pipe' });
  }, 'YAML file must be strictly valid YAML containing all 5 required jobs');
});

test('CI rls-matrix job defines clean checkout, postgres service, Python 3.11, and runner script on ubuntu-latest', () => {
  const content = fs.readFileSync(workflowPath, 'utf8');

  // Verify rls-matrix job attributes
  assert.match(content, /rls-matrix:\s*\n\s*name:\s*RLS Access Control Matrix Verification/);
  assert.match(content, /runs-on:\s*ubuntu-latest/);
  assert.match(content, /services:\s*\n\s*postgres:/);
  assert.match(content, /image:\s*pgvector\/pgvector:pg16/);
  assert.match(content, /uses:\s*actions\/checkout@v4/);
  assert.match(content, /uses:\s*actions\/setup-python@v5/);
  assert.match(content, /python-version:\s*['"]?3\.11['"]?/);
  assert.match(content, /python scripts\/ci_rls_matrix\.py --validate-only/);
});

test('RLS matrix runner script exists and validates current repository with zero regressions', () => {
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

test('Negative Fault Injection Proof 1: Policy regression on sensitive table (illegal INSERT to anon) triggers exit code 1', () => {
  const fixtureName = '20261099999998_regression_sensitive_leak.sql';
  const fixturePath = path.join(migrationsDir, fixtureName);

  try {
    fs.writeFileSync(
      fixturePath,
      '-- Intentional policy regression injection on sensitive table\nGRANT INSERT ON TABLE public.admin_users TO anon;\n',
      'utf8'
    );

    let failed = false;
    let output = '';
    try {
      execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
        cwd: root,
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (err) {
      failed = true;
      output = (err.stdout || '') + (err.stderr || '');
    }

    assert.ok(failed, 'CI RLS matrix validator must fail (non-zero exit code) on sensitive table privilege regression');
    assert.match(output, /POLICY REGRESSION/i);
    assert.match(output, /admin_users/);
  } finally {
    if (fs.existsSync(fixturePath)) {
      fs.unlinkSync(fixturePath);
    }
  }
});

test('Negative Fault Injection Proof 2: Mutation policy regression on public table (DELETE to authenticated) triggers exit code 1', () => {
  const fixtureName = '20261099999999_regression_public_mutation.sql';
  const fixturePath = path.join(migrationsDir, fixtureName);

  try {
    fs.writeFileSync(
      fixturePath,
      '-- Intentional mutation policy regression injection on public read table\nCREATE POLICY "leak_auth_delete" ON public.places FOR DELETE TO authenticated USING (true);\n',
      'utf8'
    );

    let failed = false;
    let output = '';
    try {
      execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
        cwd: root,
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (err) {
      failed = true;
      output = (err.stdout || '') + (err.stderr || '');
    }

    assert.ok(failed, 'CI RLS matrix validator must fail (non-zero exit code) on public table mutation policy regression');
    assert.match(output, /POLICY REGRESSION/i);
    assert.match(output, /places/);
  } finally {
    if (fs.existsSync(fixturePath)) {
      fs.unlinkSync(fixturePath);
    }
  }
});

test('Clean recovery verification: Zero regressions and exit code 0 after fixture cleanup', () => {
  const result = execSync(`python "${scriptPath.replace(/\\/g, '/')}" --validate-only`, {
    cwd: root,
    encoding: 'utf8',
  });

  assert.match(result, /RLS ACCESS CONTROL MATRIX VERIFICATION PASSED \(0 REGRESSIONS\)/i);
});
