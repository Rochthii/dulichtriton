import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '../src');
function loader(mocks = {}, globals = {}) {
  const modules = new Map();
  function load(file) {
    file = path.resolve(file);
    if (modules.has(file)) return modules.get(file).exports;
    if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
    const module = { exports: {} }; modules.set(file, module);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    const resolve = id => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id === 'next/link') return { __esModule: true, default: ({ children, prefetch: _prefetch, ...props }) => React.createElement('a', props, children) };
      if (['react', 'react/jsx-runtime', 'lucide-react'].includes(id)) return require(id);
      if (id.startsWith('@/') || id.startsWith('.')) {
        let target = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(file), id);
        if (!path.extname(target)) target += fs.existsSync(target + '.tsx') ? '.tsx' : '.ts';
        return load(target);
      }
      throw new Error(`Unexpected dependency: ${id}`);
    };
    new Function('module', 'exports', 'require', ...Object.keys(globals), outputText)(module, module.exports, resolve, ...Object.values(globals));
    return module.exports;
  }
  return load;
}
const helpers = loader()(path.join(root, 'lib/savedPlaces.ts'));
const { SAVED_PLACES_KEY: key, SAVED_PLACES_CHANGED_EVENT: eventName, readSavedPlaces, isPlaceSaved, toggleSavedPlace } = helpers;
const place = { id: 'legacy-1', place_id: 'external-1', slug: 'ho-ta-pa', name: 'Hồ Tà Pạ' };
function storageFixture(entries = []) {
  const values = new Map(entries); const writes = [];
  return { values, writes, getItem: key => values.get(key) ?? null, setItem(key, value) { writes.push([key, value]); values.set(key, value); } };
}

test('Legacy IDs remain readable, aliases are removed together and new saves prefer stable slugs', () => {
  const storage = storageFixture([[key, JSON.stringify([' legacy-1 ', 'ho-ta-pa', 'legacy-1', 'other'])], ['triton_custom_itinerary', '["draft"]'], ['triton_saved_itineraries', '["tour"]']]);
  assert.deepEqual(readSavedPlaces(storage), ['legacy-1', 'ho-ta-pa', 'other']);
  assert.equal(isPlaceSaved(readSavedPlaces(storage), place), true);
  assert.deepEqual(toggleSavedPlace(storage, place), { saved: ['other'], isSaved: false });
  assert.deepEqual(toggleSavedPlace(storage, place), { saved: ['other', 'ho-ta-pa'], isSaved: true });
  assert.equal(isPlaceSaved(readSavedPlaces(storage), { id: 'different-db-uuid', slug: place.slug }), true);
  assert.equal(storage.values.get('triton_custom_itinerary'), '["draft"]');
  assert.equal(storage.values.get('triton_saved_itineraries'), '["tour"]');
  assert.ok(storage.writes.every(([writtenKey]) => writtenKey === key));
});

test('Missing, corrupt and blocked storage never gets silently overwritten', () => {
  assert.deepEqual(readSavedPlaces(storageFixture()), []);
  for (const raw of ['bad-json', 'null', '{}', '[1]', '[""]', '[" "]']) {
    const storage = storageFixture([[key, raw]]);
    assert.throws(() => toggleSavedPlace(storage, place));
    assert.equal(storage.values.get(key), raw); assert.deepEqual(storage.writes, []);
  }
  const storage = storageFixture();
  assert.throws(() => toggleSavedPlace(storage, {})); assert.deepEqual(storage.writes, []);
  assert.throws(() => readSavedPlaces({ getItem() { throw new Error('blocked'); } }));
});

test('Each toggle reads current persisted values rather than overwriting a stale snapshot', () => {
  const storage = storageFixture([[key, '["other-tab"]']]);
  assert.deepEqual(toggleSavedPlace(storage, place).saved, ['other-tab', place.slug]);
  storage.values.set(key, '["other-tab","ho-ta-pa","new-tab"]');
  assert.deepEqual(toggleSavedPlace(storage, place).saved, ['other-tab', 'new-tab']);
});

function hookFixture(window, storage) {
  const slots = []; let cursor = 0; let effect;
  const react = {
    useState(value) { const i = cursor++; if (!(i in slots)) slots[i] = value; return [slots[i], next => { slots[i] = next; }]; },
    useCallback(callback) { const i = cursor++; return slots[i] ||= callback; },
    useEffect(callback) { effect ||= callback; },
  };
  const { useSavedPlaces } = loader({ react }, { window, localStorage: storage })(path.join(root, 'hooks/useSavedPlaces.ts'));
  const get = () => { cursor = 0; return useSavedPlaces(); };
  const beforeMount = get(); const cleanup = effect();
  return { get, beforeMount, cleanup };
}
function storageEvent(window, changedKey) {
  const event = new Event('storage'); Object.defineProperty(event, 'key', { value: changedKey }); window.dispatchEvent(event);
}

test('Real hook synchronizes card/detail/list within one tab and across storage events', () => {
  const storage = storageFixture(); const window = new EventTarget();
  const card = hookFixture(window, storage); const detail = hookFixture(window, storage);
  assert.equal(card.beforeMount.ready, false); assert.equal(card.get().ready, true);
  assert.equal(card.get().toggle(place), true);
  assert.deepEqual(detail.get().saved, [place.slug]);
  assert.equal(detail.get().toggle(place), false); assert.deepEqual(card.get().saved, []);
  storage.values.set(key, '["cross-tab"]'); storageEvent(window, key);
  assert.deepEqual(card.get().saved, ['cross-tab']); assert.deepEqual(detail.get().saved, ['cross-tab']);
  storage.values.clear(); storageEvent(window, null); assert.deepEqual(card.get().saved, []);
  card.cleanup(); detail.cleanup();
});

test('Hook exposes read/write errors, keeps prior data and recovers explicitly', () => {
  const storage = storageFixture([[key, '["old"]']]); const window = new EventTarget();
  const hook = hookFixture(window, storage);
  const setItem = storage.setItem;
  storage.setItem = () => { throw new Error('quota'); };
  assert.equal(hook.get().toggle(place), null); assert.match(hook.get().error, /Chưa lưu được/);
  assert.deepEqual(hook.get().saved, ['old']); assert.equal(storage.values.get(key), '["old"]');
  storage.setItem = setItem; hook.get().refresh(); assert.equal(hook.get().error, '');
  storage.values.set(key, 'corrupt'); storageEvent(window, key);
  assert.match(hook.get().error, /Chưa đọc được/); assert.deepEqual(hook.get().saved, ['old']);
  storage.values.set(key, '["recovered"]'); hook.get().refresh();
  assert.equal(hook.get().error, ''); assert.deepEqual(hook.get().saved, ['recovered']); hook.cleanup();
});

test('Blocked localStorage is a ready error state, with no write or success event', () => {
  const window = new EventTarget(); let events = 0; window.addEventListener(eventName, () => events++);
  const hook = hookFixture(window, { getItem() { throw new Error('blocked'); }, setItem() { assert.fail('must not write'); } });
  assert.equal(hook.get().ready, true); assert.ok(hook.get().error);
  assert.equal(hook.get().toggle(place), null); assert.equal(events, 0); hook.cleanup();
});

function renderButton(state) {
  const component = loader({ '@/hooks/useSavedPlaces': { useSavedPlaces: () => state } })(path.join(root, 'components/SavePlaceButton.tsx')).default;
  return renderToStaticMarkup(React.createElement(component, { place }));
}
test('Shared button SSR exposes accessible selected state, pending state and touch/focus tokens', () => {
  const pending = renderButton({ saved: [], ready: false, error: '' });
  assert.match(pending, /disabled=""/); assert.doesNotMatch(pending, /aria-pressed/);
  const selected = renderButton({ saved: [place.slug], ready: true, error: '' });
  assert.match(selected, /aria-pressed="true"/); assert.match(selected, /Bỏ lưu Hồ Tà Pạ trên thiết bị/);
  assert.match(selected, /min-h-11/); assert.match(selected, /focus-visible:outline/); assert.match(selected, /var\(--jade-deep\)/);
  assert.doesNotMatch(renderButton({ saved: [place.slug], ready: true, error: 'blocked' }), /aria-pressed/);
});

function renderPage(state, query = 'saved=1') {
  const component = loader({
    'next/navigation': { useSearchParams: () => new URLSearchParams(query) },
    '@/hooks/useSavedPlaces': { useSavedPlaces: () => state },
    '@/lib/supabase': { supabase: {} }, '@/lib/fastCache': {},
    '@/components/PlaceCard': { __esModule: true, default: ({ place }) => React.createElement('article', { 'data-place': place.slug || place.id }, place.name) },
  })(path.join(root, 'app/places/page.tsx')).default;
  return renderToStaticMarkup(React.createElement(component));
}
test('Saved view renders only matching saved cards and hides unsaved spotlight recommendations', () => {
  const pois = JSON.parse(fs.readFileSync(path.join(root, 'data/triton_pois_full.json'), 'utf8'));
  const target = pois.find(p => p.slug); assert.ok(target);
  const html = renderPage({ saved: [target.slug], ready: true, error: '' });
  assert.equal((html.match(/data-place=/g) || []).length, 1);
  assert.ok(html.includes(`data-place="${target.slug}"`));
  assert.match(html, /Điểm đã lưu/); assert.match(html, /hai mục riêng/);
  assert.doesNotMatch(html, /<main/);
  const all = renderPage({ saved: [], ready: true, error: '' }, '');
  assert.ok((all.match(/data-place=/g) || []).length > 1);
});
test('Saved view loading, empty, unmatched and storage-error states offer honest recovery', () => {
  const pending = renderPage({ saved: [], ready: false, error: '' });
  assert.match(pending, /Đang đọc điểm đã lưu/); assert.doesNotMatch(pending, /Bạn chưa lưu/);
  const empty = renderPage({ saved: [], ready: true, error: '' });
  assert.match(empty, /Bạn chưa lưu điểm nào/); assert.match(empty, /Khám phá để lưu điểm/);
  const unmatched = renderPage({ saved: ['removed-from-catalog'], ready: true, error: '' });
  assert.match(unmatched, /Không có điểm đã lưu khớp danh mục/);
  const failed = renderPage({ saved: [], ready: true, error: 'Không đọc được bộ nhớ' });
  assert.match(failed, /role="alert"/); assert.match(failed, /Thử đọc lại danh sách/); assert.doesNotMatch(failed, /Bạn chưa lưu điểm nào/);
});

test('Card/detail share one save control; itinerary draft storage stays separate; mobile menu exposes saved view', () => {
  const card = fs.readFileSync(path.join(root, 'components/PlaceCard.tsx'), 'utf8');
  const detail = fs.readFileSync(path.join(root, 'components/PlaceDetailClient.tsx'), 'utf8');
  assert.match(card, /<SavePlaceButton place=\{place\} compact/); assert.doesNotMatch(card, /triton_fav_places/);
  assert.match(detail, /<SavePlaceButton place=\{place\}/); assert.match(detail, /triton_custom_itinerary/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'lib/savedPlaces.ts'), 'utf8'), /triton_custom_itinerary|triton_saved_itineraries/);
  assert.match(fs.readFileSync(path.join(root, 'components/SiteNav.tsx'), 'utf8'), /href: "\/places\?saved=1"/);
});
