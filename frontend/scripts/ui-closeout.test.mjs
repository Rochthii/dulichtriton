import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '../src');
function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
    const module = { exports: {} }; cache.set(file, module);
    const resolve = id => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id === 'next/link') return { __esModule: true, default: ({ children, prefetch: _prefetch, ...props }) => React.createElement('a', props, children) };
      if (id.startsWith('@/') || id.startsWith('.')) {
        let target = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(file), id);
        if (!path.extname(target)) target += fs.existsSync(target + '.tsx') ? '.tsx' : '.ts';
        return load(target);
      }
      return require(id);
    };
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } });
    new Function('module', 'exports', 'require', ...Object.keys(globals), outputText)(module, module.exports, resolve, ...Object.values(globals));
    return module.exports;
  }
  return relative => load(path.join(root, relative));
}
function find(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (Array.isArray(tree)) return tree.map(item => find(item, predicate)).find(Boolean);
  if (predicate(tree)) return tree;
  return find(tree.props?.children, predicate);
}

test('Both markdown renderers share safe links, preserve internal navigation and escape HTML', () => {
  const load = loader({ './ItineraryExportModal': { __esModule: true, default: () => null }, '@/lib/pdfExporter': {} });
  const { RichTextRenderer } = load('components/RichTextRenderer.tsx');
  const Chat = load('components/FormattedChatMessage.tsx').default;
  const content = '[Điểm đến](/places/ho-ta-pa) [Nguồn](https://example.com/source) [X](javascript:alert%281%29) [Y](data:text/html,evil) **Đậm** *Nghiêng* <img src=x>';
  for (const Component of [RichTextRenderer, Chat]) {
    const html = renderToStaticMarkup(React.createElement(Component, { content }));
    assert.match(html, /href="\/places\/ho-ta-pa"/);
    assert.match(html, /href="https:\/\/example.com\/source"/);
    assert.doesNotMatch(html, /href="(?:javascript|data):|<img/);
    assert.match(html, /&lt;img src=x&gt;/); assert.match(html, /<strong/); assert.match(html, /<em/);
  }
});

test('Chat time retains minutes; detail lists and tables expose keyboard-readable structure', () => {
  const load = loader({ './ItineraryExportModal': { __esModule: true, default: () => null }, '@/lib/pdfExporter': {} });
  const Chat = load('components/FormattedChatMessage.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Chat, { content: '## Gợi ý\n07:30 — Ghé điểm A' }));
  assert.match(html, />07:30</); assert.match(html, /Ghé điểm A/); assert.doesNotMatch(html, /## Gợi ý/);
  const { RichTextRenderer } = load('components/RichTextRenderer.tsx');
  const detail = renderToStaticMarkup(React.createElement(RichTextRenderer, { content: '- Mục A\n- Mục B\n\n| Cột A | Cột B |\n| --- | --- |\n| Một | Hai |' }));
  assert.match(detail, /<ul/); assert.match(detail, /<li/); assert.match(detail, /tabindex="0"/); assert.match(detail, /<table/);
});

test('Save error recovery opens toward the card interior for footer and image controls', () => {
  const Save = loader({
    react: { useState: initial => [initial === false ? true : initial, () => {}] },
    '@/hooks/useSavedPlaces': { useSavedPlaces: () => ({ saved: [], ready: true, error: 'Bộ nhớ bị chặn', refresh() {} }) },
  })('components/SavePlaceButton.tsx').default;
  for (const [feedbackPlacement, position] of [['above', 'left-0 bottom-full'], ['below', 'right-0 top-full']]) {
    const html = renderToStaticMarkup(React.createElement(Save, { place: { slug: 'sample', name: 'Mẫu' }, feedbackPlacement }));
    assert.ok(html.includes(position)); assert.match(html, /role="alert"/); assert.match(html, /Thử đọc lại/);
  }
});

function pageFixture(page, initialResponse) {
  const slots = []; let cursor = 0; let effects = []; let response = initialResponse; let requests = 0; let cacheCalls = 0;
  const react = { ...React,
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }]; },
    useMemo(callback) { cursor++; return callback(); },
    useEffect(callback, deps) {
      const i = cursor++; const previous = slots[i];
      if (!previous || deps.some((value, j) => value !== previous.deps[j])) {
        const record = { deps, cleanup: undefined }; slots[i] = record;
        effects.push(() => { previous?.cleanup?.(); record.cleanup = callback(); });
      }
    },
  };
  const field = page === 'stay' ? 'stays' : page;
  const fallback = { id: 'fallback', slug: 'fallback', name: 'FALLBACK', category: page === 'food' ? 'gastronomy' : page, commune: 'Tri Tôn' };
  const load = loader({ react,
    '@/data/triton_pois_full.json': [fallback], '@/data/tri_ton_stays.json': [fallback],
    '@/components/SavePlaceButton': { __esModule: true, default: () => React.createElement('button', { 'aria-label': 'Lưu trên thiết bị' }) },
    '@/lib/fastCache': { fetchWithCache: async (_key, fn) => { cacheCalls++; return fn(); } },
  }, { fetch: async () => { requests++; return response; }, console: { warn() {} } });
  const Page = load(`app/${page}/page.tsx`).default;
  function render() { cursor = 0; const tree = Page(); const pending = effects; effects = []; pending.forEach(fn => fn()); return tree; }
  return { field, render, html: () => renderToStaticMarkup(render()), response: next => { response = next; }, counts: () => ({ requests, cacheCalls }) };
}
const tick = () => new Promise(setImmediate);
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });

for (const page of ['food', 'stay', 'culture']) {
  test(`${page}: HTTP/shape failure preserves fallback with recovery; retry bypasses cache and valid empty clears old cards`, async () => {
    for (const failed of [json({ error: 'unavailable' }, 503), json({ success: true })]) {
      const fixture = pageFixture(page, failed); fixture.render(); await tick();
      assert.match(fixture.html(), /role="alert"/); assert.match(fixture.html(), /Chưa cập nhật được/); assert.match(fixture.html(), /FALLBACK/);
      fixture.response(json({ [fixture.field]: [] }));
      const retry = find(fixture.render(), element => element.props?.actionLabel === 'Thử tải lại'); assert.ok(retry);
      retry.props.onAction(); fixture.render(); await tick();
      const html = fixture.html(); assert.doesNotMatch(html, /Chưa cập nhật được|FALLBACK/); assert.match(html, /Xóa tất cả bộ lọc/);
      assert.deepEqual(fixture.counts(), { requests: 2, cacheCalls: 1 });
    }
  });
  test(`${page}: filter selection updates visible cards and exposes pressed state`, async () => {
    const fixture = pageFixture(page, json({ [page === 'stay' ? 'stays' : page]: [{ id: 'sample', slug: 'sample', name: 'MẪU_DUY_NHẤT', category: page === 'food' ? 'gastronomy' : page, commune: 'Tri Tôn' }] }));
    fixture.render(); await tick(); assert.match(fixture.html(), /MẪU_DUY_NHẤT/);
    assert.match(fixture.html(), /aria-label="Chỉ đường đến MẪU_DUY_NHẤT"/);
    const chip = find(fixture.render(), element => element.type?.name === 'FilterChip' && !element.props.active); assert.ok(chip);
    chip.props.onClick(); const html = fixture.html();
    assert.match(html, /aria-pressed="true"/); assert.match(html, /Xóa tất cả bộ lọc/);
  });
}

test('Culture missing image/rating stays unknown and never substitutes stock or 4.9', async () => {
  const fixture = pageFixture('culture', json({ culture: [{ id: 'sample', slug: 'sample', name: 'MẪU', category: 'culture', rating: null, image_url: '', commune: 'Tri Tôn' }] }));
  fixture.render(); await tick(); const html = fixture.html();
  assert.match(html, /Chưa có ảnh địa điểm: MẪU/); assert.match(html, /Chưa có đánh giá/); assert.doesNotMatch(html, /unsplash|>4\.9</);
});

test('Real metadata/page source never invents an image, review count, parking or visitor suitability', async () => {
  let place = { id: 'sample', slug: 'sample', name: 'MẪU', category: 'nature', rating: 4.5 };
  const { default: Page, generateMetadata } = loader({
    '@/lib/places': { getPlaceById: async () => place },
    '../../../components/PlaceDetailClient': { __esModule: true, default: () => null },
  })('app/places/[id]/page.tsx');
  const params = Promise.resolve({ id: 'sample' });
  for (const image_url of ['', 'https://images.unsplash.com/stock', 'https://cdn.test/tri_ton_hero/hero.jpg']) {
    place = { ...place, image_url }; const metadata = await generateMetadata({ params });
    assert.deepEqual(metadata.openGraph.images, []); assert.deepEqual(metadata.twitter.images, []);
  }
  let tree = await Page({ params });
  let schema = JSON.parse(find(tree, element => element.type === 'script').props.dangerouslySetInnerHTML.__html)['@graph'][0];
  assert.equal(schema.aggregateRating, undefined); assert.equal(schema.image, undefined);
  assert.equal(schema.amenityFeature, undefined); assert.equal(schema.touristType, undefined);
  place = { ...place, image_url: 'https://cdn.test/real-location.jpg', review_count: 17 };
  const metadata = await generateMetadata({ params }); assert.equal(metadata.openGraph.images[0].url, place.image_url);
  tree = await Page({ params }); schema = JSON.parse(find(tree, element => element.type === 'script').props.dangerouslySetInnerHTML.__html)['@graph'][0];
  assert.equal(schema.aggregateRating.ratingCount, 17); assert.equal(schema.aggregateRating.ratingValue, 4.5);
});
