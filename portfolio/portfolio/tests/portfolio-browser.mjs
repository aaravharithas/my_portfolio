// Run against `npm start -- --port 3005` and a disposable Chrome CDP session on :9226.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:3005';
const debug = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9226';
const tabs = await (await fetch(`${debug}/json/list`)).json();
const ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  const request = pending.get(message.id);
  if (!request) return;
  clearTimeout(request.timer);
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => reject(new Error(`Timed out: ${method}`)), 20000);
    pending.set(requestId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression) {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(`!!(${expression})`)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Condition failed: ${expression}`);
}
async function key(key, code, windowsVirtualKeyCode, modifiers = 0) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode, modifiers });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode, modifiers });
}
async function search(text) {
  await evaluate(`document.querySelector('[cmdk-input]').focus()`);
  await key('a', 'KeyA', 65, 2);
  await send('Input.insertText', { text });
}
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: base });
  // Wait for hydration, not just server HTML: clicks before React attaches handlers are lost.
  await until(`document.readyState === 'complete' && Object.keys(document.querySelector('[aria-label="Open navigation and commands"]') || {}).some(key => key.startsWith('__reactProps'))`);
  await evaluate('document.fonts.ready.then(() => true)');
  assert.equal(await evaluate(`document.documentElement.classList.contains('dark')`), true);
  assert.equal(await evaluate(`getComputedStyle(document.body).backgroundColor`), 'rgb(8, 8, 8)');
  assert.match(await evaluate(`getComputedStyle(document.querySelector('h1')).fontFamily`), /League Spartan/);
  for (const width of [375, 768, 1280]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 850, deviceScaleFactor: 1, mobile: false });
    await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `overflow at ${width}`);
    await evaluate(`document.querySelector('[aria-label="Open navigation and commands"]').click()`);
    await until(`document.querySelector('[role="dialog"]') && document.activeElement.matches('[cmdk-input]')`);
    // Compare geometry only once the zoom-in has finished; heavy pages render slowly in headless Chrome.
    await until(`document.querySelector('[role="dialog"]').getAnimations().every(animation => animation.playState === 'finished')`);
    const geometry = await evaluate(`(() => { const n=document.querySelector('nav').getBoundingClientRect(); const d=document.querySelector('[role="dialog"]').getBoundingClientRect(); return {width: Math.abs(n.width-d.width),left: Math.abs(n.left-d.left),gap:d.top-n.bottom,bottom:d.bottom,height:innerHeight}; })()`);
    assert.ok(geometry.width < 1 && geometry.left < 1, `palette alignment at ${width}: ${JSON.stringify(geometry)}`);
    assert.ok(geometry.gap >= 0 && geometry.gap <= 12);
    assert.ok(geometry.bottom <= geometry.height);
    assert.equal(await evaluate(`document.querySelector('[role="dialog"]').innerText.includes('Twitter')`), false);
    assert.equal(await evaluate(`/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i.test(document.body.innerText)`), false, 'email must not be visible');
    await mkdir('/tmp/portfolio-foundation-screenshots', { recursive: true });
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`/tmp/portfolio-foundation-screenshots/${width}.png`, Buffer.from(data, 'base64'));
    await key('Escape', 'Escape', 27);
    await until(`!document.querySelector('[role="dialog"]')`);
    assert.equal(await evaluate(`document.activeElement.getAttribute('aria-label')`), 'Open navigation and commands');
  }
  for (const modifiers of [2, 4]) {
    await key('k', 'KeyK', 75, modifiers);
    await until(`!!document.querySelector('[role="dialog"]')`);
    await key('Escape', 'Escape', 27);
    await until(`!document.querySelector('[role="dialog"]')`);
  }
  await key('k', 'KeyK', 75, 2);
  await until(`!!document.querySelector('[cmdk-input]')`);
  await search('no-such-command-xyz');
  await until(`document.querySelector('[cmdk-empty]')?.textContent.includes('No matching')`);
  await search('Work');
  await key('Enter', 'Enter', 13);
  await until(`location.hash === '#work' && !document.querySelector('[role="dialog"]')`);
  await key('k', 'KeyK', 75, 2);
  await until(`!!document.querySelector('[cmdk-input]')`);
  // Deterministic clipboard behavior without exposing the actual email in test output.
  await evaluate(`void Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copiedEmail = value; } } })`);
  await search('Copy email');
  await key('Enter', 'Enter', 13);
  await until(`document.querySelector('[role="dialog"] [role="status"]').textContent.includes('Email copied')`);
  assert.equal(await evaluate(`typeof window.__copiedEmail === 'string' && window.__copiedEmail.includes('@')`), true);
  await evaluate(`void Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } })`);
  await key('Enter', 'Enter', 13);
  await until(`document.querySelector('[role="dialog"] [role="status"]').textContent.includes('Copy failed')`);
  await key('Escape', 'Escape', 27);
  await until(`!document.querySelector('[role="dialog"]')`);
  await key('k', 'KeyK', 75, 2);
  await until(`!!document.querySelector('[role="dialog"]')`);
  // Radix attaches its outside-click listener asynchronously after opening.
  await until(`document.querySelector('[role="dialog"]').getAnimations().every(animation => animation.playState === 'finished')`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 5, y: 750, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 5, y: 750, button: 'left', clickCount: 1 });
  await until(`!document.querySelector('[role="dialog"]')`);
  // Off-screen animations pause and resume.
  await evaluate(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })`);
  await until(`document.querySelector('.hero-bg').classList.contains('paused')`);
  await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await until(`!document.querySelector('.hero-bg').classList.contains('paused')`);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.equal(await evaluate(`getComputedStyle(document.documentElement).scrollBehavior`), 'auto');
  for (const selector of ['.badge-ring', '.hb']) assert.equal(await evaluate(`getComputedStyle(document.querySelector('${selector}')).animationName`), 'none', `${selector} must stop`);
  assert.equal(await evaluate(`[...document.querySelectorAll('.letter-column')].every(e => getComputedStyle(e).transform === 'none')`), true);
  // Private API fields must never reach the HTML or RSC payload.
  const api = await (await fetch('https://portfolioapi.pythonanywhere.com/portfolio/aaravharithas/')).json();
  const html = await (await fetch(base)).text();
  assert.deepEqual(['dob', 'address', 'zipCode', 'phone'].filter(field => api[field] && html.includes(api[field])), []);
  assert.deepEqual(errors, []);
  console.log('PASS: 375/768/1280px, off-screen pause/resume, private fields absent, reduced motion stops marquee/badge/blobs/letter roll, dark tokens, League Spartan hero font, palette alignment, shortcuts, focus, filtering, navigation, email privacy/copy success/failure, outside dismissal, reduced motion, no runtime exceptions.');
} finally {
  ws.close();
}
