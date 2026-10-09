// Dependency-free integration checks against a local Chrome DevTools endpoint.
// Start Vite and headless Chrome first; see README for commands.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5175';
const debug = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9225';
const pages = await (await fetch(`${debug}/json/list`)).json();
const ws = new WebSocket(pages.find((page) => page.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
const errors = [];
let documentReady;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`Timeout: ${method}`)); }, 15000);
    pending.set(requestId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
}
let apiMode = 'success';
const fixture = JSON.parse(await readFile(new URL('../src/data/fallbackPortfolio.json', import.meta.url), 'utf8'));
fixture.skills.push({ name: 123 });
fixture.social.twitter = 'javascript:alert(1)';
fixture.projects = Array.from({ length: 5 }, (_, i) => ({ ...fixture.projects[0], title: `Project ${i + 1}`, image: `${base}/missing-preview.jpg` }));
ws.onmessage = async ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timer);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result);
  }
  if (message.method === 'Page.domContentEventFired') documentReady?.();
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + message.params.exceptionDetails.exception?.description);
  if (message.method === 'Fetch.requestPaused') {
    const { requestId, request } = message.params;
    try {
      if (request.url.includes('/portfolio/aaravharithas/')) {
        if (apiMode === 'stall') return;
        await send('Fetch.fulfillRequest', { requestId, responseCode: apiMode === 'error' ? 503 : 200,
          responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(apiMode === 'invalid' ? { name: 123 } : fixture)).toString('base64') });
      } else await send('Fetch.continueRequest', { requestId });
    } catch { /* A navigation may cancel an intercepted request. */ }
  }
};
async function navigate(method, params = {}) {
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Navigation timed out')), 15000);
    documentReady = () => { clearTimeout(timer); documentReady = null; resolve(); };
  });
  await send(method, params);
  await ready;
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression) {
  for (let i = 0; i < 80; i++) { if (await evaluate(`Boolean(${expression})`)) return; await sleep(100); }
  throw new Error(`Condition failed: ${expression}`);
}
async function click(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await sleep(80);
}
async function openSettings() {
  if (!await evaluate(`document.querySelector('.settings-panel').open`)) await click('.settings-trigger');
}
async function choose(key, value) {
  await openSettings();
  await click(`.setting-option input[name="${key}"][value="${value}"]`);
}
async function closeSettings() {
  if (await evaluate(`document.querySelector('.settings-panel').open`)) await click('.settings-close');
}
async function keypress(key, code, virtualKey, modifiers = 0) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: virtualKey, modifiers });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKey, modifiers });
  await sleep(80);
}
async function screenshot(name) {
  await mkdir('/tmp/portfolio-theme-screenshots', { recursive: true });
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(`/tmp/portfolio-theme-screenshots/${name}.png`, Buffer.from(data, 'base64'));
}
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*portfolio/aaravharithas/*' }] });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate('Page.navigate', { url: base });
  await until(`document.querySelector('.settings-trigger') && document.querySelectorAll('.project-card').length === 3`);
  await evaluate('localStorage.clear()');
  await navigate('Page.reload');
  await until(`document.querySelector('.settings-trigger') && document.querySelectorAll('.project-card').length === 3`);
  await sleep(650);
  assert.equal(await evaluate('document.documentElement.dataset.design'), 'clay');
  await choose('designTheme', 'glass');
  await closeSettings();
  await evaluate(`document.querySelector('#projects').scrollIntoView({ behavior: 'instant' })`);
  await until(`document.querySelectorAll('.project-image.image-placeholder').length === 3`);
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  assert.equal(await evaluate('document.querySelectorAll("canvas").length'), 0);
  assert.equal(await evaluate('document.body.classList.contains("cursor-hidden")'), false);
  // Native dialog: focus containment, Escape, backdrop dismissal, and radio keyboard input.
  await openSettings();
  assert.equal(await evaluate(`document.activeElement.classList.contains('settings-close')`), true);
  await keypress('Tab', 'Tab', 9, 8);
  assert.equal(await evaluate(`document.activeElement.classList.contains('settings-done')`), true);
  await keypress('Tab', 'Tab', 9);
  assert.equal(await evaluate(`document.activeElement.classList.contains('settings-close')`), true);
  await evaluate(`document.querySelector('input[name=colorMode][value=light]').focus()`);
  await keypress('ArrowRight', 'ArrowRight', 39);
  assert.equal(await evaluate('document.documentElement.dataset.mode'), 'dark');
  await keypress('ArrowLeft', 'ArrowLeft', 37);
  assert.equal(await evaluate('document.documentElement.dataset.mode'), 'light');
  await keypress('Escape', 'Escape', 27);
  assert.equal(await evaluate(`document.querySelector('.settings-panel').open`), false);
  assert.equal(await evaluate(`document.activeElement.classList.contains('settings-trigger')`), true);
  await openSettings();
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 10, y: 300, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 10, y: 300, button: 'left', clickCount: 1 });
  await until(`!document.querySelector('.settings-panel').open`);

  // Scroll reveals leave content visible and animate once when it enters view.
  await evaluate(`document.querySelector('#contact').scrollIntoView({ behavior: 'instant' })`);
  await sleep(80);
  assert.equal(await evaluate(`document.querySelector('#contact').getAnimations().some(a => a.playState === 'running')`), true);
  await sleep(550);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#contact')).opacity`), '1');
  assert.notEqual(await evaluate(`getComputedStyle(document.documentElement).scrollbarColor`), 'auto');
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await sleep(80);
  const buttonPoint = await evaluate(`(() => { const r = document.querySelector('.hero .button--primary').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...buttonPoint, button: 'left', clickCount: 1 });
  await sleep(180);
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('.hero .button--primary')).transform`), 'none');
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...buttonPoint, button: 'left', clickCount: 1 });
  await sleep(700);

  // Form, tab, and pagination state survive material and color changes.
  await evaluate(`(() => { const input = document.querySelector('input[name="name"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Theme switch test'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await click('#tab-experience');
  await click('.pagination button:last-child');
  await screenshot('glass-light-desktop');
  for (const design of ['glass', 'clay', 'neumorphism']) {
    await choose('designTheme', design);
    for (const mode of ['light', 'dark']) {
      await choose('colorMode', mode);
      assert.equal(await evaluate('document.documentElement.dataset.design'), design);
      assert.equal(await evaluate('document.documentElement.dataset.mode'), mode);
      assert.equal(await evaluate('document.querySelector("input[name=name]").value'), 'Theme switch test');
      assert.equal(await evaluate('document.querySelector("#tab-experience").getAttribute("aria-selected")'), 'true');
      assert.equal(await evaluate('document.querySelector(".pagination span").textContent'), '2 / 2');
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.project-card')).backdropFilter`), design === 'glass' ? 'blur(10px)' : 'none');
      assert.equal(await evaluate(`document.querySelector('.hero-profile') !== null`), ['clay', 'neumorphism'].includes(design));
      if (design !== 'glass') assert.equal(await evaluate(`[...document.querySelectorAll('body *')].some(element => getComputedStyle(element).backdropFilter !== 'none')`), false);
      await closeSettings();
      await evaluate('window.scrollTo(0, 0)');
      await sleep(500);
      await screenshot(`${design}-${mode}-desktop`);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: width === 320 ? 568 : 900, deviceScaleFactor: 1, mobile: false });
        await sleep(100);
        const overflow = await evaluate('document.documentElement.scrollWidth > window.innerWidth');
        assert.equal(overflow, false, `${design}/${mode} overflows at ${width}px`);
        if (width === 320) {
          await openSettings();
          assert.equal(await evaluate(`document.querySelector('.settings-done').getBoundingClientRect().bottom <= innerHeight`), true, 'Done stays visible on short screens');
          await evaluate(`document.querySelector('.settings-categories').scrollTop = 10000`);
          assert.equal(await evaluate(`document.querySelector('.settings-close').getBoundingClientRect().top >= 0`), true);
          await screenshot(`${design}-${mode}-settings-short`);
          await closeSettings();
        }
        if (width === 390) {
          await screenshot(`${design}-${mode}-mobile`);
          await openSettings();
          assert.equal(await evaluate(`document.querySelector('.settings-panel').getBoundingClientRect().right <= innerWidth`), true);
          await screenshot(`${design}-${mode}-settings-mobile`);
          await closeSettings();
        }
      }
    }
  }
  await navigate('Page.reload');
  await until(`document.querySelector('.settings-trigger')`);
  assert.equal(await evaluate('document.documentElement.dataset.design'), 'neumorphism');
  assert.equal(await evaluate('document.documentElement.dataset.mode'), 'dark');
  assert.equal(await evaluate('document.documentElement.dataset.motion'), 'full');
  assert.equal(await evaluate(`document.querySelector('input[name=effects]')`), null);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await until(`document.documentElement.dataset.motion === 'reduced'`);
  assert.equal(await evaluate(`getComputedStyle(document.documentElement).scrollBehavior`), 'auto');
  assert.equal(await evaluate('document.getAnimations().filter(a => a.playState === "running").length'), 0);
  // API failure and a never-finishing request both leave content immediately usable.
  apiMode = 'error';
  await navigate('Page.reload');
  await until(`document.querySelector('.footer-meta [role="status"]')`);
  assert.equal(await evaluate('document.querySelector("h1").textContent.includes("Gaurav")'), true);
  assert.equal(await evaluate('document.querySelectorAll(".project-card").length'), 3, 'Cached API projects survive reload during outage');
  apiMode = 'invalid';
  await navigate('Page.reload');
  await until(`document.querySelector('.footer-meta [role="status"]')`);
  assert.equal(await evaluate('document.querySelectorAll(".project-card").length'), 3, 'Malformed response does not replace cached content');
  apiMode = 'stall';
  await navigate('Page.reload');
  await until(`document.querySelector('h1') && document.querySelector('.settings-trigger')`);
  await choose('designTheme', 'glass');
  assert.equal(await evaluate('document.documentElement.dataset.design'), 'glass');
  await until(`document.querySelector('.footer-meta [role="status"]')`);
  // Browser-storage restrictions should not crash the provider or disable switching.
  const { identifier } = await send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });` });
  apiMode = 'success';
  await navigate('Page.reload');
  await until(`document.querySelector('.settings-trigger')`);
  await choose('designTheme', 'clay');
  assert.equal(await evaluate('document.documentElement.dataset.design'), 'clay');
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier });
  assert.deepEqual(errors, [], 'Uncaught browser errors');
  console.log('PASS: six theme combinations, five viewport widths, state preservation, persistence, image fallback, reduced motion, API failure/timeout, and blocked storage.');
  console.log('Screenshots: /tmp/portfolio-theme-screenshots');
} finally {
  ws.close();
}
