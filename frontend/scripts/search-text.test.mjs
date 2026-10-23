import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import typescript from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/searchText.ts', import.meta.url), 'utf8');
const { outputText } = typescript.transpileModule(source, {
  compilerOptions: { module: typescript.ModuleKind.CommonJS },
});
const exports = {};
runInNewContext(outputText, { exports });

test('Shared search normalization preserves Vietnamese matching in browser and server', () => {
  const { removeVietnameseTones } = exports;
  for (const input of ['  Chùa Xà Tón ĐẸP  ', '  Chùa Xà Tón ĐẸP  '.normalize('NFD')]) {
    assert.equal(removeVietnameseTones(input), 'chua xa ton dep');
  }
  assert.equal(removeVietnameseTones('Ẩm Thực • LƯU TRÚ'), 'am thuc • luu tru');
  assert.equal(removeVietnameseTones(''), '');
  assert.equal(removeVietnameseTones(' food-tour-1 '), 'food-tour-1');
});
