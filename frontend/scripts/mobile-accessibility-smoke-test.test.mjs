/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEST SUITE: P07-010 — Mobile Accessibility Smoke Test Release-Gate Suite
 * (Proof: Keyboard, Focus, Reduced Motion và Contrast Checklist Pass 100%)
 * 
 * RÀNG BUỘC KIỂM TOÁN HỆ THỐNG SẢN XUẤT (PRODUCTION-REAL SYSTEM CONSTRAINTS):
 * 1. WCAG 2.1 Contrast Checklist Invariant: Tính toán toán học độ chói (Relative
 *    Luminance) và tỷ lệ tương phản màu sắc W3C cho toàn bộ bảng màu Folk-Modern
 *    Bảy Núi. 100% các cặp màu chính đạt chuẩn WCAG AA (>= 4.5:1) và AAA (>= 7.0:1).
 * 2. Reduced Motion Invariant: Kiểm chứng media query `@media (prefers-reduced-motion: reduce)`
 *    trong `globals.css` vô hiệu hóa hoàn toàn chuyển động (<= 0.01ms !important)
 *    và vô hiệu hóa scroll-behavior mượt để bảo vệ du khách nhạy cảm thị giác.
 * 3. Mobile Keyboard & Focus Visible Invariant: Kiểm chứng quy tắc `:focus-visible`
 *    toàn cục và các lớp CSS focus-visible trên các thành phần di động (`MobileBottomNav.tsx`,
 *    `Header.tsx`, `ChatbotWidget.tsx`).
 * 4. WAI-ARIA Modal & No Keyboard Trap Invariant: Cửa sổ Trợ lý AI và Mobile Navigation
 *    Drawer tuân thủ chuẩn WAI-ARIA Modal Dialog (`role="dialog"`, `aria-modal="true"`),
 *    có phím tắt `Escape` để thoát modal tức thì (WCAG 2.1.2 No Keyboard Trap).
 * 5. Strict Fault Injection Invariants: Đánh chặn tức thì các cặp màu tương phản kém,
 *    lỗi định dạng HEX, và các modal thiếu Escape handler (fail-closed guarantee).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  calculateContrastRatio,
  calculateRelativeLuminance,
  hexToRgb,
  evaluatePaletteContrastMatrix
} from '../src/lib/accessibilityChecklist.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');

const globalsCssPath = path.join(frontendDir, 'src', 'app', 'globals.css');
const mobileBottomNavPath = path.join(frontendDir, 'src', 'components', 'MobileBottomNav.tsx');
const chatbotWidgetPath = path.join(frontendDir, 'src', 'components', 'ChatbotWidget.tsx');
const headerPath = path.join(frontendDir, 'src', 'components', 'Header.tsx');

test.describe('P07-010: Mobile Accessibility Smoke Test Release-Gate Suite', () => {

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 1: WCAG 2.1 COLOR CONTRAST MATHEMATICAL CHECKLIST INVARIANT
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 1: WCAG 2.1 Color Contrast Mathematical Checklist & Palette Invariants', () => {
    const results = evaluatePaletteContrastMatrix();

    assert.ok(results.length >= 8, 'Must evaluate at least 8 core design system color pairs');

    // 1. Primary Text (--ink #26221B) on Main Background (--bg #FAF3E7)
    const inkOnBg = results.find(r => r.name.includes('--ink on --bg'));
    assert.ok(inkOnBg, 'Must evaluate ink on bg');
    assert.ok(inkOnBg.ratio >= 14.0, `Ink on bg contrast must be >= 14.0:1, got ${inkOnBg.ratio}`);
    assert.equal(inkOnBg.wcagAANormalText, true, 'Must pass WCAG AA for normal text');
    assert.equal(inkOnBg.wcagAAAEnhanced, true, 'Must pass WCAG AAA enhanced contrast');

    // 2. Primary Text (--ink #26221B) on Surface Card (--surface #FFFDF7)
    const inkOnSurface = results.find(r => r.name.includes('--ink on --surface'));
    assert.ok(inkOnSurface, 'Must evaluate ink on surface');
    assert.ok(inkOnSurface.ratio >= 15.0, `Ink on surface contrast must be >= 15.0:1, got ${inkOnSurface.ratio}`);
    assert.equal(inkOnSurface.wcagAANormalText, true, 'Must pass WCAG AA for normal text');
    assert.equal(inkOnSurface.wcagAAAEnhanced, true, 'Must pass WCAG AAA enhanced contrast');

    // 3. Muted/Secondary Text (--ink-soft #6B6355) on Main Background (--bg #FAF3E7)
    const inkSoftOnBg = results.find(r => r.name.includes('--ink-soft on --bg'));
    assert.ok(inkSoftOnBg, 'Must evaluate ink-soft on bg');
    assert.ok(inkSoftOnBg.ratio >= 4.5, `Muted text must pass WCAG AA (>= 4.5:1), got ${inkSoftOnBg.ratio}`);
    assert.equal(inkSoftOnBg.wcagAANormalText, true, 'Must pass WCAG AA for normal text');

    // 4. Primary CTA Palm Button (--ink on --palm #F0A32F)
    const ctaPalm = results.find(r => r.name.includes('--ink on --palm'));
    assert.ok(ctaPalm, 'Must evaluate ink on palm button');
    assert.ok(ctaPalm.ratio >= 7.0, `Palm CTA button contrast must be >= 7.0:1 (AAA), got ${ctaPalm.ratio}`);
    assert.equal(ctaPalm.wcagAAAEnhanced, true, 'Must pass WCAG AAA for CTA buttons');

    // 5. White Text on Deep Jade Button Hover (#FFFFFF on #0B6B60)
    const whiteOnJade = results.find(r => r.name.includes('--surface on --jade-deep'));
    assert.ok(whiteOnJade, 'Must evaluate white on deep jade');
    assert.ok(whiteOnJade.ratio >= 4.5, `White on deep jade must be >= 4.5:1, got ${whiteOnJade.ratio}`);
    assert.equal(whiteOnJade.wcagAANormalText, true, 'Must pass WCAG AA');

    // 6. Night Mode Text (#F8FAFC on #151B34)
    const nightModeText = results.find(r => r.name.includes('Night Mode White Text'));
    assert.ok(nightModeText, 'Must evaluate night mode white text');
    assert.ok(nightModeText.ratio >= 15.0, `Night mode contrast must be >= 15.0:1, got ${nightModeText.ratio}`);
    assert.equal(nightModeText.wcagAAAEnhanced, true, 'Must pass WCAG AAA');

    // 100% of tested pairs must at least satisfy WCAG AA Large/UI controls (>= 3.0:1)
    for (const item of results) {
      assert.ok(
        item.wcagAALargeTextOrUI,
        `Color pair "${item.name}" failed minimum UI contrast requirement: ratio=${item.ratio}`
      );
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 2: REDUCED MOTION MEDIA QUERY INVARIANT
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 2: Reduced Motion Media Query Invariant', () => {
    assert.ok(fs.existsSync(globalsCssPath), 'globals.css must exist');
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

    // Must define prefers-reduced-motion media query
    assert.ok(
      cssContent.includes('@media (prefers-reduced-motion: reduce)'),
      'globals.css must define @media (prefers-reduced-motion: reduce)'
    );

    // Must reset animation-duration, transition-duration, and scroll-behavior
    assert.ok(
      cssContent.includes('animation-duration: 0.01ms !important;') ||
      cssContent.includes('animation-duration: 0ms !important;'),
      'Must reset animation-duration to minimal or zero with !important'
    );
    assert.ok(
      cssContent.includes('transition-duration: 0.01ms !important;') ||
      cssContent.includes('transition-duration: 0ms !important;'),
      'Must reset transition-duration to minimal or zero with !important'
    );
    assert.ok(
      cssContent.includes('scroll-behavior: auto !important;'),
      'Must reset scroll-behavior to auto !important'
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 3: MOBILE KEYBOARD NAVIGATION & FOCUS VISIBLE INVARIANTS
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 3: Mobile Keyboard Navigation & Focus Visible Invariants', () => {
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

    // 1. Global Focus Indicator Rule in CSS
    assert.ok(
      cssContent.includes(':focus-visible'),
      'globals.css must declare global :focus-visible rules'
    );
    assert.ok(
      cssContent.includes('outline:') && cssContent.includes('outline-offset:'),
      ':focus-visible must provide clear outline and outline-offset indicator'
    );

    // 2. Mobile Bottom Navigation Accessibility
    assert.ok(fs.existsSync(mobileBottomNavPath), 'MobileBottomNav.tsx must exist');
    const mobileNavContent = fs.readFileSync(mobileBottomNavPath, 'utf8');

    assert.ok(
      mobileNavContent.includes('aria-label="Mobile Navigation"'),
      'MobileBottomNav must have landmark aria-label'
    );
    assert.ok(
      mobileNavContent.includes('aria-label="Hỏi Trợ Lý Du Lịch Tri Tôn AI"'),
      'Bot button in MobileBottomNav must have accessible aria-label'
    );
    assert.ok(
      mobileNavContent.includes('focus-visible:outline-none') &&
      mobileNavContent.includes('focus-visible:ring-2'),
      'MobileBottomNav items must declare focus-visible ring styles for keyboard navigation'
    );

    // 3. Header Mobile Menu Toggle Button
    assert.ok(fs.existsSync(headerPath), 'Header.tsx must exist');
    const headerContent = fs.readFileSync(headerPath, 'utf8');

    assert.ok(
      headerContent.includes('aria-label=') && headerContent.includes('menu điều hướng'),
      'Mobile menu toggle button in Header must have descriptive aria-label'
    );
    assert.ok(
      headerContent.includes('aria-expanded={mobileMenuOpen}'),
      'Mobile menu toggle button must reflect expanded state via aria-expanded'
    );
    assert.ok(
      headerContent.includes('focus-visible:ring-2'),
      'Mobile menu toggle button must have focus-visible styling'
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 4: WAI-ARIA MODAL DIALOG & NO KEYBOARD TRAP INVARIANTS
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 4: WAI-ARIA Modal Dialog & No Keyboard Trap Invariants', () => {
    assert.ok(fs.existsSync(chatbotWidgetPath), 'ChatbotWidget.tsx must exist');
    const chatbotContent = fs.readFileSync(chatbotWidgetPath, 'utf8');

    // 1. WAI-ARIA Dialog Semantics on Chatbot Modal
    assert.ok(
      chatbotContent.includes('role="dialog"'),
      'Chatbot modal container must define role="dialog"'
    );
    assert.ok(
      chatbotContent.includes('aria-modal="true"'),
      'Chatbot modal container must declare aria-modal="true"'
    );
    assert.ok(
      chatbotContent.includes('aria-label="Cửa sổ Trợ lý AI Du Lịch Tri Tôn"'),
      'Chatbot modal container must have accessible aria-label'
    );

    // 2. WCAG 2.1.2: No Keyboard Trap — Escape Key Listener
    assert.ok(
      chatbotContent.includes("e.key === 'Escape'") && chatbotContent.includes('setIsOpen(false)'),
      'ChatbotWidget must listen to Escape key to dismiss modal'
    );

    // 3. Header Mobile Drawer Escape Handler
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    assert.ok(
      headerContent.includes("e.key === 'Escape'") && headerContent.includes('setMobileMenuOpen(false)'),
      'Header must listen to Escape key to dismiss mobile drawer'
    );
    assert.ok(
      headerContent.includes('role="dialog"'),
      'Header mobile drawer must declare role="dialog"'
    );

    // 4. Accessible Interactive Controls
    assert.ok(
      chatbotContent.includes('aria-label="Đóng cửa sổ chat"'),
      'Close button must have aria-label'
    );
    assert.ok(
      chatbotContent.includes('aria-label="Xóa lịch sử trò chuyện"'),
      'Clear history button must have aria-label'
    );
    assert.ok(
      chatbotContent.includes('aria-label="Gửi tin nhắn"'),
      'Send button must have aria-label'
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 5: FAULT INJECTION & STRICT COMPLIANCE INTERCEPTION INVARIANTS
  // ───────────────────────────────────────────────────────────────────────────
  test('Suite 5: Fault Injection & Strict Compliance Interception Invariants', () => {
    // 1. Low-contrast pair must fail WCAG AA
    const lowContrastRatio = calculateContrastRatio('#A0A0A0', '#FFFFFF');
    assert.ok(lowContrastRatio < 3.0, `Light gray on white ratio must be low (< 3.0), got ${lowContrastRatio}`);
    assert.equal(lowContrastRatio >= 4.5, false, 'Low contrast pair must strictly fail WCAG AA');

    // 2. Invalid HEX format must throw error
    assert.throws(
      () => hexToRgb('invalid-hex'),
      /Invalid HEX color format/,
      'hexToRgb must throw on malformed hex input'
    );
    assert.throws(
      () => hexToRgb('#12'),
      /Invalid HEX color format/,
      'hexToRgb must throw on incomplete hex length'
    );

    // 3. Relative Luminance of pure white is 1, pure black is 0
    const whiteLuminance = calculateRelativeLuminance('#FFFFFF');
    const blackLuminance = calculateRelativeLuminance('#000000');
    assert.equal(Math.round(whiteLuminance * 100) / 100, 1.0, 'White luminance must be 1.0');
    assert.equal(Math.round(blackLuminance * 100) / 100, 0.0, 'Black luminance must be 0.0');

    // Maximum possible contrast ratio is 21:1
    const maxRatio = calculateContrastRatio('#000000', '#FFFFFF');
    assert.equal(maxRatio, 21.0, 'Max contrast ratio between black and white must be 21:1');
  });

});
