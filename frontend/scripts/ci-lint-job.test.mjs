import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const workflowPath = path.join(root, '.github', 'workflows', 'ci.yml');
const eslintConfigPath = path.join(root, 'frontend', 'eslint.config.mjs');
const frontendDir = path.join(root, 'frontend');

test('CI workflow file exists and defines lint job alongside build job', () => {
  assert.ok(fs.existsSync(workflowPath), '.github/workflows/ci.yml must exist');
  const content = fs.readFileSync(workflowPath, 'utf8');
  assert.ok(content.length > 50, 'Workflow file must not be empty');

  // Verify YAML syntax via Python pyyaml
  const pyCheck = `python -c "import yaml; data = yaml.safe_load(open(r'${workflowPath.replace(/\\/g, '/')}', encoding='utf-8')); assert 'jobs' in data; assert 'build' in data['jobs']; assert 'lint' in data['jobs']"`;
  assert.doesNotThrow(() => {
    execSync(pyCheck, { stdio: 'pipe' });
  }, 'YAML file must be strictly valid YAML containing both build and lint jobs');
});

test('CI lint job defines clean checkout, node setup, and npm run lint on ubuntu-latest', () => {
  const content = fs.readFileSync(workflowPath, 'utf8');

  // Verify lint job properties
  assert.match(content, /lint:\s*\n\s*name:\s*Lint Codebase/);
  assert.match(content, /runs-on:\s*ubuntu-latest/);
  assert.match(content, /uses:\s*actions\/checkout@v4/);
  assert.match(content, /uses:\s*actions\/setup-node@v4/);
  assert.match(content, /working-directory:\s*frontend/);
  assert.match(content, /run:\s*npm run lint/);
});

test('frontend ESLint configuration exists and exports valid config', () => {
  assert.ok(fs.existsSync(eslintConfigPath), 'frontend/eslint.config.mjs must exist');
  const content = fs.readFileSync(eslintConfigPath, 'utf8');
  assert.match(content, /export default eslintConfig;/);
  assert.match(content, /globalIgnores/);
});

test('codebase currently passes linter with zero errors (exit code 0)', () => {
  const result = execSync('npm run lint', {
    cwd: frontendDir,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  // Must not throw and must contain zero errors indication
  assert.doesNotMatch(result, /error\s+/i);
});

test('FAULT INJECTION PROOF: lint failure causes linter to fail with non-zero exit code', () => {
  const fixturePath = path.join(frontendDir, 'src', 'scratch_lint_fail_fixture.ts');

  try {
    // Inject a blatant lint/syntax parsing error that triggers fatal ESLint error
    fs.writeFileSync(fixturePath, 'const invalidSyntax = ;\n', 'utf8');

    // Running eslint must fail and throw with non-zero exit code
    assert.throws(
      () => {
        execSync('npm run lint -- src/scratch_lint_fail_fixture.ts', {
          cwd: frontendDir,
          encoding: 'utf8',
          stdio: 'pipe',
        });
      },
      (err) => {
        // Assert that the failure is captured and error code is non-zero
        assert.ok(err.status !== 0, 'Linter must return a non-zero exit code when errors exist');
        const output = (err.stdout?.toString() || '') + (err.stderr?.toString() || '');
        assert.match(output, /error/i, 'Output must report an error');
        return true;
      },
      'Fault injection must cause npm run lint to exit with non-zero code'
    );
  } finally {
    // Clean up fixture file
    if (fs.existsSync(fixturePath)) {
      fs.unlinkSync(fixturePath);
    }
  }

  // Recovery verification: after removing faulty file, lint check returns cleanly without errors
  const recoveryResult = execSync('npm run lint -- src/app/page.tsx', {
    cwd: frontendDir,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  assert.doesNotMatch(recoveryResult, /error\s+/i);
});
