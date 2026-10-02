/**
 * frontend/scripts/test-export-base-exporter.test.mjs
 * 
 * Automated Verification Suite for P05-010:
 * "Sửa import BaseExporter trong một test đang fail (Proof: test collection pass)"
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

test('P05-010 Assertion 1: Pytest collection passes with 0 errors across entire tests directory', () => {
  const pyCollect = spawnSync('pytest', ['--collect-only', 'tests'], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  assert.equal(
    pyCollect.status,
    0,
    `Pytest collection must exit with 0. Stderr: ${pyCollect.stderr}\nStdout: ${pyCollect.stdout}`
  );
  assert.ok(
    /collected \d+ items/.test(pyCollect.stdout) || /\d+ tests collected/.test(pyCollect.stdout),
    'Pytest collection must discover test items successfully'
  );
  assert.ok(
    !pyCollect.stdout.includes('ERROR collecting') && !pyCollect.stderr.includes('ERROR collecting'),
    'There must be zero collection errors'
  );
});

test('P05-010 Assertion 2: tests/test_export.py executes and passes 100%', () => {
  const pyTest = spawnSync('pytest', ['-p', 'no:cacheprovider', 'tests/test_export.py'], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  assert.equal(
    pyTest.status,
    0,
    `tests/test_export.py must pass with exit code 0. Stderr: ${pyTest.stderr}\nStdout: ${pyTest.stdout}`
  );
  assert.ok(
    pyTest.stdout.includes('1 passed') || pyTest.stdout.includes('passed'),
    'test_json_exporter test must pass successfully'
  );
});

test('P05-010 Assertion 3: BaseExporter inheritance contract verified in Python runtime', () => {
  const pyInheritance = spawnSync(
    'python',
    ['-c', `
from tourism_crawler.export.exporter import BaseExporter, DataExporter
from tourism_crawler.export.json_export import JSONExporter
from tourism_crawler.export.csv_export import CSVExporter
from tourism_crawler.export.geojson_export import GeoJSONExporter

assert issubclass(JSONExporter, BaseExporter), "JSONExporter must inherit BaseExporter"
assert issubclass(CSVExporter, BaseExporter), "CSVExporter must inherit BaseExporter"
assert issubclass(GeoJSONExporter, BaseExporter), "GeoJSONExporter must inherit BaseExporter"

# Verify export method is callable
assert hasattr(JSONExporter, "export"), "JSONExporter must implement export"
assert hasattr(CSVExporter, "export"), "CSVExporter must implement export"
assert hasattr(GeoJSONExporter, "export"), "GeoJSONExporter must implement export"
print("INHERITANCE_VERIFIED_SUCCESS")
`],
    {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    }
  );

  assert.equal(
    pyInheritance.status,
    0,
    `Inheritance contract check must exit with code 0. Stderr: ${pyInheritance.stderr}`
  );
  assert.ok(
    pyInheritance.stdout.includes('INHERITANCE_VERIFIED_SUCCESS'),
    'All exporter subclasses must properly inherit BaseExporter'
  );
});

test('P05-010 Assertion 4: Static source audit - BaseExporter defined in exporter.py and exported in __init__.py', () => {
  const exporterPath = path.join(REPO_ROOT, 'tourism_crawler', 'export', 'exporter.py');
  const initPath = path.join(REPO_ROOT, 'tourism_crawler', 'export', '__init__.py');

  const exporterContent = fs.readFileSync(exporterPath, 'utf-8');
  const initContent = fs.readFileSync(initPath, 'utf-8');

  assert.ok(
    exporterContent.includes('class BaseExporter(ABC):'),
    'exporter.py must define class BaseExporter(ABC)'
  );
  assert.ok(
    exporterContent.includes('def export(self, records: List[Dict[str, Any]], output_filepath: str) -> None:'),
    'BaseExporter must declare abstract export method signature'
  );
  assert.ok(
    initContent.includes('BaseExporter'),
    '__init__.py must re-export BaseExporter'
  );
});

test('P05-010 Assertion 5: JSONExporter produces valid structured JSON file matching schema', () => {
  const pyExportRun = spawnSync(
    'python',
    ['-c', `
import tempfile, json, os
from tourism_crawler.export.json_export import JSONExporter

with tempfile.TemporaryDirectory() as tmpdir:
    out_file = os.path.join(tmpdir, "out.json")
    exporter = JSONExporter()
    test_data = [{"id": "PL_TEST", "name": "Chùa Xà Tón", "commune": "Thị trấn Tri Tôn"}]
    exporter.export(test_data, out_file)
    
    assert os.path.exists(out_file), "Output file must exist"
    with open(out_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert data["metadata"]["total_records"] == 1
    assert data["metadata"]["district"] == "Tri Tôn"
    assert data["records"][0]["name"] == "Chùa Xà Tón"
    print("EXPORT_PAYLOAD_VERIFIED")
`],
    {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    }
  );

  assert.equal(
    pyExportRun.status,
    0,
    `Export execution check must exit with code 0. Stderr: ${pyExportRun.stderr}`
  );
  assert.ok(
    pyExportRun.stdout.includes('EXPORT_PAYLOAD_VERIFIED'),
    'JSONExporter must create valid JSON structure with metadata and records'
  );
});
