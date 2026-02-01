# HeroSection.jsx – Code Analysis

## Critical issues

### 1. **Missing `id="home"` (navigation broken)**
- Navbar links to `#home` (see `Navbar.jsx`: `{ name: "Home", href: "#home" }`).
- Hero section has no `id`, so "Home" does not scroll to the hero.
- **Fix:** Add `id="home"` to the hero `<motion.section>`.

### 2. **Greeting exit animation never runs**
- The greeting `<motion.h2>` has `exit={{ opacity: 0, y: -20, scale: 1.1 }}` (line 91).
- Exit animations in Framer Motion only run when the element is a direct child of `<AnimatePresence>`.
- There is no `AnimatePresence` around the greeting, so the exit animation never plays when the greeting text changes.
- **Fix:** Wrap the greeting in `<AnimatePresence mode="wait">` and give the motion.h2 a stable `key={currentGreeting}` (already present).

### 3. **Missing `100dvh` for mobile viewport**
- Section uses only `min-h-[calc(100vh-4rem)]` etc. (line 57).
- On mobile, `100vh` includes the browser UI; `100dvh` avoids that and prevents overflow.
- **Fix:** Add `min-h-[calc(100dvh-4rem)]` (and equivalent for sm/md/lg) as we did earlier, or ensure they were not reverted.

### 4. **Unused imports**
- `glassmorphic` (line 5) – never used.
- `getNameGradient` (line 6) – never used.
- **Fix:** Remove unused imports to avoid lint noise and confusion.

### 5. **Unused variable: `loading`**
- `loading` is destructured from `usePortfolio()` but never used.
- Hero always renders with fallback text; no loading/skeleton state.
- **Fix:** Either use `loading` (e.g. show skeleton) or remove from destructuring.

---

## Moderate issues

### 6. **Heavy duplication: two CTA buttons**
- "View My Work" and "Get In Touch" share almost the same structure: liquid glass gradient, 6 floating particles, same motion/a styles.
- Only differences: `href`, label text, and first button uses `onMouseEnter`/`onMouseLeave` for boxShadow (second uses `whileHover` boxShadow).
- **Fix:** Extract a reusable `GlassButton` (or render function) with `href`, `label`, optional `onMouseEnter`/`onMouseLeave`, and reuse for both. Reduces drift and ~80 lines of duplicate code.

### 7. **Negative margin on CTA wrapper**
- Line 170: `style={{ overflow: 'visible', padding: '15px', margin: '-15px' }}`.
- Negative margin can cause overflow, horizontal scroll, or odd touch targets.
- **Fix:** Prefer a wrapper without negative margin, or use a larger hit area with positive padding and ensure parent has `overflow: visible` only where needed.

### 8. **Description hardcoded**
- The paragraph "Crafting elegant digital experiences..." is hardcoded (line 160).
- If the API provides a tagline/description (e.g. `portfolioData.tagline` or `portfolioData.description`), it should be used with a fallback.
- **Fix:** Use `portfolioData?.tagline ?? portfolioData?.description ?? "Crafting elegant..."` if the API supports it; otherwise document that it’s intentional.

### 9. **Accessibility**
- Section has no `aria-label` for the hero landmark (e.g. `aria-label="Introduction"` or `aria-label="Hero"`).
- Rotating greeting has no `aria-live`; screen readers may not announce changes.
- **Fix:** Add `aria-label` on the section and `aria-live="polite"` (and optionally `aria-atomic="true"`) on the greeting container so updates are announced.

### 10. **Magic numbers**
- `150` (minWidth px), `15` (margin/padding px), `6` (particle count), `2000` (interval ms) are inline.
- **Fix:** Define named constants at the top (e.g. `GREETING_INTERVAL_MS`, `CTA_WRAPPER_PADDING`, `PARTICLE_COUNT`) for easier tuning and readability.

---

## Minor / code quality

### 11. **Redundant `overflow: 'visible'`**
- Many elements have `style={{ overflow: 'visible' }}`; that’s the default unless a parent or utility overrides it.
- **Fix:** Remove where not needed, or add a short comment where it’s required to counteract a parent (e.g. button with `overflow: hidden`).

### 12. **Semantic outline**
- Hero uses one `h1` (name) and one `h2` (title). Rest of page (About, Projects, etc.) should use consistent heading levels (e.g. section titles as `h2`) so the document outline is correct. Not a bug in HeroSection alone but worth checking globally.

### 13. **Performance**
- 12 infinite `motion.div` particles (6 per button) plus 2 large blurred orbs with long animations. Generally fine, but on very low-end devices could consider reducing particle count or disabling blur animation when `prefers-reduced-motion: reduce`.
- **Fix:** Optional: respect `prefers-reduced-motion` for particle/orb animations (e.g. no or reduced motion).

---

## Summary table

| # | Severity   | Issue                          | Fix (short)                    |
|---|------------|--------------------------------|--------------------------------|
| 1 | Critical   | Missing `id="home"`            | Add `id="home"` to section     |
| 2 | Critical   | Greeting exit never runs       | Wrap greeting in AnimatePresence |
| 3 | Critical   | No 100dvh for mobile           | Add dvh min-height variants    |
| 4 | Critical   | Unused imports                 | Remove glassmorphic, getNameGradient |
| 5 | Critical   | Unused `loading`               | Use or remove from destructuring |
| 6 | Moderate   | Duplicate CTA button code      | Extract GlassButton / shared UI |
| 7 | Moderate   | Negative margin on CTA wrapper | Remove or replace with safe layout |
| 8 | Moderate   | Description hardcoded          | Use API field if available     |
| 9 | Moderate   | A11y: no aria-label / aria-live | Add landmark and live region   |
|10 | Moderate   | Magic numbers                  | Named constants                |
|11 | Minor      | Redundant overflow: visible    | Remove or document              |
|12 | Minor      | Heading outline                | Check section headings globally |
|13 | Minor      | Motion and performance         | Optional reduced-motion support |
