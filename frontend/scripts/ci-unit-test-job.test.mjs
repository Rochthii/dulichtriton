import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const workflowPath = path.join(root, '.github', 'workflows', 'ci.yml');
const frontendPackagePath = path.join(root, 'frontend', 'package.json');
const frontendDir = path.join(root, 'frontend');
const testsDir = path.join(root, 'tests');

// Isolate child node:test executions from parent test runner context
const cleanEnv = { ...process.env };
delete cleanEnv.NODE_TEST_CONTEXT;

test('CI workflow file exists and defines unit-test job alongside build and lint', () => {
  assert.ok(fs.existsSync(workflowPath), '.github/workflows/ci.yml must exist');
  const content = fs.readFileSync(workflowPath, 'utf8');
  assert.ok(content.length > 50, 'Workflow file must not be empty');

  // Verify YAML syntax via Python pyyaml
  const pyCheck = `python -c "import yaml; data = yaml.safe_load(open(r'${workflowPath.replace(/\\/g, '/')}', encoding='utf-8')); assert 'jobs' in data; assert 'build' in data['jobs']; assert 'lint' in data['jobs']; assert 'unit-test' in data['jobs']"`;
  assert.doesNotThrow(() => {
    execSync(pyCheck, { stdio: 'pipe' });
  }, 'YAML file must be strictly valid YAML containing build, lint, and unit-test jobs');
});

test('CI unit-test job defines clean checkout, Node 20, Python 3.11, and test commands on ubuntu-latest', () => {
  const content = fs.readFileSync(workflowPath, 'utf8');

  // Verify unit-test job attributes
  assert.match(content, /unit-test:\s*\n\s*name:\s*Run Unit Tests/);
  assert.match(content, /runs-on:\s*ubuntu-latest/);
  assert.match(content, /uses:\s*actions\/checkout@v4/);

  // Node setup & test run
  assert.match(content, /uses:\s*actions\/setup-node@v4/);
  assert.match(content, /npm\s+--prefix\s+frontend\s+ci/);
  assert.match(content, /run:\s*npm test/);

  // Python setup & pytest run
  assert.match(content, /uses:\s*actions\/setup-python@v5/);
  assert.match(content, /python-version:\s*['"]?3\.11['"]?/);
  assert.match(content, /pip install -r requirements\.txt/);
  assert.match(content, /pytest -p no:cacheprovider tests/);
});

test('frontend package.json defines test script', () => {
  assert.ok(fs.existsSync(frontendPackagePath), 'frontend/package.json must exist');
  const pkg = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
  assert.ok(pkg.scripts?.test, 'frontend package.json must define a test script');
  assert.match(pkg.scripts.test, /node\s+--test/);
});

test('codebase currently passes unit test suites cleanly with zero errors', () => {
  // 1. Pytest suite must pass 100%
  const pyResult = execSync('pytest -p no:cacheprovider tests', {
    cwd: root,
    encoding: 'utf8',
  });
  assert.match(pyResult, /13 passed/i, 'Pytest suite must pass all 13 test items');

  // 2. Node CI build job verification test passes (execSync throws if non-zero exit code)
  assert.doesNotThrow(() => {
    execSync('node --test frontend/scripts/ci-build-job.test.mjs', {
      cwd: root,
      encoding: 'utf8',
      env: cleanEnv,
    });
  }, 'Node build job test must pass cleanly without throwing');
});

test('FAULT INJECTION PROOF: Node unit-test failure causes runner to exit with non-zero code', () => {
  const fixturePath = path.join(frontendDir, 'scripts', 'scratch_fail_fixture.test.mjs');

  try {
    // Inject a deliberately failing node unit-test fixture
    const failingCode = `import test from 'node:test';
import assert from 'node:assert/strict';

test('deliberately failing unit test for fault injection proof', () => {
  assert.strictEqual(1, 2, 'Injected unit test failure must fail assertion');
});
`;
    fs.writeFileSync(fixturePath, failingCode, 'utf8');

    let thrownError = null;
    try {
      execSync(`node --test "${fixturePath.replace(/\\/g, '/')}"`, {
        cwd: root,
        encoding: 'utf8',
        env: cleanEnv,
      });
    } catch (err) {
      thrownError = err;
    }

    assert.ok(thrownError !== null, 'Fault injection must cause test runner to exit with non-zero code');
    assert.notEqual(thrownError.status, 0, 'Node test runner must return non-zero exit code on failure');
  } finally {
    // Clean up fixture file
    if (fs.existsSync(fixturePath)) {
      fs.unlinkSync(fixturePath);
    }
  }

  // Recovery assertion: fixture file is confirmed deleted
  assert.ok(!fs.existsSync(fixturePath), 'Fixture file must be cleanly deleted');
});

test('FAULT INJECTION PROOF: Pytest failure causes test runner to exit with non-zero code', () => {
  const pyFixturePath = path.join(testsDir, 'test_scratch_fail_fixture.py');

  try {
    // Inject a deliberately failing pytest fixture
    const failingPyCode = `def test_deliberate_pytest_failure():
    assert 1 == 2, "Injected pytest failure must fail assertion"
`;
    fs.writeFileSync(pyFixturePath, failingPyCode, 'utf8');

    let thrownError = null;
    try {
      execSync(`pytest -p no:cacheprovider "${pyFixturePath.replace(/\\/g, '/')}"`, {
        cwd: root,
        encoding: 'utf8',
      });
    } catch (err) {
      thrownError = err;
    }

    assert.ok(thrownError !== null, 'Fault injection must cause pytest to exit with non-zero code');
    assert.notEqual(thrownError.status, 0, 'Pytest must return non-zero exit code on test failure');
  } finally {
    // Clean up fixture file
    if (fs.existsSync(pyFixturePath)) {
      fs.unlinkSync(pyFixturePath);
    }
  }

  // Recovery assertion: running pytest suite returns 100% pass (exit code 0)
  const recoveryPyResult = execSync('pytest -p no:cacheprovider tests', {
    cwd: root,
    encoding: 'utf8',
  });
  assert.match(recoveryPyResult, /13 passed/i, 'Pytest suite must cleanly pass all 13 items after recovery');
});
