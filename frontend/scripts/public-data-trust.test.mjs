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
    if (id === 'next/link') return { __esModule: true, default: ({ children, prefetch: _prefetch, ...props }) => React.createElement('a', props, children) };
    if (['react', 'react/jsx-runtime', 'lucide-react'].includes(id)) return require(id);
    if (id.startsWith('@/') || id.startsWith('.')) {
      let target = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(file), id);
      if (!path.extname(target)) target += fs.existsSync(target + '.tsx') ? '.tsx' : '.ts';
      return load(target);
    }
    throw new Error(`Unexpected dependency: ${id}`);
  };
  new Function('module', 'exports', 'require', outputText)(module, module.exports, resolve);
  return module.exports;
}
const helpers = load(path.join(root, 'lib/publicPlacePresentation.ts'));
const sanitizer = load(path.join(root, 'lib/dataSanitizer.ts'));

test('Food presentation rejects contradictory subtype and never uses names/ID prefixes as evidence', () => {
  assert.equal(helpers.isFoodListing({ category: 'food', subcategory: 'restaurant' }), true);
  for (const subcategory of ['cultural_event', 'artwork', 'water', 'Điểm check-in sống ảo']) {
    const record = { category: 'gastronomy', subcategory, name: 'Gà đốt quán ngon', id: 'AT123' };
    const original = JSON.stringify(record);
    assert.equal(helpers.isFoodListing(record), false);
    assert.equal(JSON.stringify(record), original);
  }
  assert.equal(helpers.isFoodListing({ name: 'Quán Gà Đốt', category: 'culture' }), false);
  assert.equal(helpers.isFoodListing({}), false);
});

test('Travel guide missing/corrupt metadata cannot imply free entry, hours or accessibility', () => {
  for (const input of [undefined, null, '', 'bad-json', 'null', '[]', 'true', {}, { opening_hours: {} }]) {
    const guide = sanitizer.parseTravelGuide(input);
    assert.ok(Object.values(guide).every(value => value.startsWith('Chưa có')));
  }
  const guide = sanitizer.parseTravelGuide(JSON.stringify({ opening_hours: '09:00–16:00', ticket_price: 'Thông tin do cơ sở cung cấp' }));
  assert.equal(guide.openingHours, '09:00–16:00');
  assert.equal(guide.ticketPrice, 'Thông tin do cơ sở cung cấp');
});

test('Unknown rating stays unknown; a genuine zero is preserved', () => {
  for (const value of [undefined, null, '', '   ', NaN, -1, 6, Infinity, {}, false]) assert.equal(helpers.presentRating(value), undefined);
  assert.equal(helpers.presentRating(0), 0);
  assert.equal(helpers.presentRating('4.2'), 4.2);
});

test('Missing photos never substitute a different location or stock restaurant', () => {
  assert.equal(helpers.presentPlaceImage({}), '');
  assert.equal(helpers.presentPlaceImage({ image_url: 'https://images.unsplash.com/photo-1' }), '');
  assert.equal(helpers.presentPlaceImage({ image_url: 'https://res.cloudinary.com/test/tri_ton_hero/hero.jpg' }), '');
  assert.equal(helpers.presentPlaceImage({ photos: [{ url: 'https://example.com/location.jpg' }] }), 'https://example.com/location.jpg');
  for (const name of ['Hồ chưa có ảnh', 'Khách sạn chưa có ảnh', 'Chùa chưa có ảnh']) {
    const fallback = decodeURIComponent(sanitizer.getCategoryFallbackImage('food', name));
    assert.match(fallback, /^data:image\/svg\+xml/);
    assert.match(fallback, /Chưa có ảnh địa điểm/);
    assert.doesNotMatch(fallback, /cloudinary|unsplash|<image/);
  }
  const { getOptimizedImageUrl } = load(path.join(root, 'lib/imageOptimizer.ts'));
  assert.equal(getOptimizedImageUrl(''), helpers.MISSING_PLACE_IMAGE);
  assert.equal(getOptimizedImageUrl(helpers.MISSING_PLACE_IMAGE), helpers.MISSING_PLACE_IMAGE);
  const { default: PlaceListingImage } = load(path.join(root, 'components/PlaceListingImage.tsx'));
  const html = renderToStaticMarkup(React.createElement(PlaceListingImage, { src: '', alt: 'Quán chưa có ảnh' }));
  assert.doesNotMatch(html, /<img|cloudinary|unsplash/);
  assert.match(html, /Chưa có ảnh địa điểm/);
});

test('Nearby food keeps supplied facts but cannot invent reviews or include a miscategorized festival', () => {
  const nearby = sanitizer.findDynamicNearbyFood({ id: 'origin', latitude: 10.4, longitude: 105.0 }, [
    { id: 'festival', name: 'Đua Bò', category: 'gastronomy', subcategory: 'cultural_event', latitude: 10.401, longitude: 105 },
    { id: 'cafe', name: 'Quán có dữ liệu thiếu', category: 'food', latitude: 10.402, longitude: 105 },
  ]);
  assert.deepEqual(nearby.map(item => item.id), ['cafe']);
  assert.equal(nearby[0].rating, undefined);
  assert.equal(nearby[0].reviewsCount, undefined);
  assert.deepEqual(nearby[0].specialties, []);
});

test('SSR /food excludes actual conflicting records from the current candidate artifact', () => {
  const { default: FoodPage } = load(path.join(root, 'app/food/page.tsx'));
  const html = renderToStaticMarkup(React.createElement(FoodPage));
  assert.doesNotMatch(html, /Lễ hội Đua bò Bảy Núi Tri Tôn|>Đua Bò Bảy Núi</);
  assert.doesNotMatch(html, /images\.unsplash\.com/);
  assert.match(html, /Gà Đốt|Gà đốt/);
});

test('SSR SOS shows the same existing national numbers and honest missing local directory', () => {
  const { default: EmergencyPage } = load(path.join(root, 'app/emergency/page.tsx'));
  const html = renderToStaticMarkup(React.createElement(EmergencyPage));
  const phones = [...html.matchAll(/href="tel:(\d+)"/g)].map(match => match[1]).sort();
  assert.deepEqual(phones, ['113', '114', '115']);
  assert.doesNotMatch(html, /0296|0918|0974|100%|Xác minh/);
  assert.match(html, /Danh bạ địa phương đang đối chiếu/);
  assert.match(html, /chinhphu\.vn/);
  assert.match(html, /Gọi 115/);
});

test('Audited public entry points do not expose disputed local phone CTA or export hotline', () => {
  for (const file of ['app/page.tsx', 'components/PlaceDetailClient.tsx', 'components/SiteFooter.tsx', 'components/ItineraryExportModal.tsx']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(source, /0296[. ]?3874[. ]?(113|115)|0296 3771 999|communeEmergency\.(policePhone|healthPhone)/, file);
  }
  const detail = fs.readFileSync(path.join(root, 'components/PlaceDetailClient.tsx'), 'utf8');
  assert.doesNotMatch(detail, /getFoodSignatureMenu|~280k|4 – 29 chỗ vào tận nơi/);
  assert.match(detail, /Chưa có xác nhận điều kiện tiếp cận/);
});
