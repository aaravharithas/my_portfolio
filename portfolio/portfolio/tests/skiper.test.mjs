import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectTiles } from '../lib/bento.ts';
import { contactError, parseContact } from '../lib/contact.ts';
import { contrast, readableOn } from '../lib/color.ts';
import { POST } from '../app/api/contact/route.ts';

test('project tiles mix big squares, tall, wide and small tiles without holes for any count', () => {
  assert.deepEqual(projectTiles(0), []);
  assert.deepEqual(projectTiles(1), ['solo']);
  assert.deepEqual(projectTiles(2), ['pair-big', 'pair-tall']);
  assert.deepEqual(projectTiles(3), ['big', 'wide', 'wide']);
  assert.deepEqual(projectTiles(4), ['big', 'tall', 'small', 'small']);
  assert.deepEqual(projectTiles(5), ['big', 'tall', 'small', 'small', 'banner']);
  assert.deepEqual(projectTiles(6), ['big', 'tall', 'small', 'small', 'wide', 'wide']);
  assert.deepEqual(projectTiles(7), ['big', 'tall', 'small', 'small', 'big-right', 'wide', 'wide']);
  assert.deepEqual(projectTiles(8), ['big', 'tall', 'small', 'small', 'big-right', 'tall', 'small', 'small']);
  // Area check on the 4-column grid: every block covers 2 full rows (8 cells) and leftovers one full row (4 cells).
  const cells = { big: 4, 'big-right': 4, tall: 2, small: 1, wide: 2, banner: 4 };
  for (let n = 3; n <= 13; n++) {
    const area = projectTiles(n).reduce((sum, size) => sum + cells[size], 0);
    const blocks = Math.floor(n / 4) + (n % 4 === 3 ? 1 : 0);
    assert.equal(area, blocks * 8 + (n % 4 === 2 || n % 4 === 1 ? 4 : 0), `n=${n}`);
  }
});

test('contact validation trims, checks email shape and enforces limits', () => {
  assert.equal(contactError('email', ' ann@example.com '), '');
  for (const bad of ['', 'ann', 'ann@', 'ann@example', 'a b@example.com']) assert.notEqual(contactError('email', bad), '', bad);
  assert.notEqual(contactError('name', '   '), '');
  assert.equal(contactError('message', 'x'.repeat(280)), '');
  assert.notEqual(contactError('message', 'x'.repeat(281)), '');
  assert.deepEqual(parseContact({ email: ' ann@example.com ', name: ' Ann ', message: 'Hi' }), { email: 'ann@example.com', name: 'Ann', message: 'Hi' });
  for (const body of [null, 'text', {}, { email: 'ann@example.com', name: 'Ann' }, { email: 'ann@example.com', name: 'Ann', message: 42 }]) assert.equal(parseContact(body), null);
});

const valid = { email: 'ann@example.com', name: 'Ann', message: 'Hello there' };
const post = (body, ip) => POST(new Request('http://localhost/api/contact', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: typeof body === 'string' ? body : JSON.stringify(body),
}));

test('contact route: dev fallback, honeypot, validation, Resend payload and 3-per-minute rate limit', async () => {
  const sent = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => { sent.push({ url, init }); return new Response('{}', { status: 200 }); };
  try {
    // Without credentials (outside production) it logs and still answers 200, sending nothing.
    const warn = console.warn; console.warn = () => {};
    const devResponse = await post(valid, '10.0.0.1');
    console.warn = warn;
    assert.equal(devResponse.status, 200);
    assert.equal((await devResponse.json()).dev, true);

    process.env.RESEND_API_KEY = 'test-key';
    process.env.CONTACT_TO_EMAIL = 'owner@example.com';
    assert.equal((await post({ ...valid, website: 'https://spam.example' }, '10.0.0.2')).status, 200);
    assert.equal(sent.length, 0, 'honeypot submissions must not send');
    assert.equal((await post({ ...valid, email: 'nope' }, '10.0.0.3')).status, 400);
    assert.equal((await post('not json', '10.0.0.4')).status, 400);

    assert.equal((await post(valid, '10.0.0.5')).status, 200);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].url, 'https://api.resend.com/emails');
    assert.equal(sent[0].init.headers.Authorization, 'Bearer test-key');
    const payload = JSON.parse(sent[0].init.body);
    assert.deepEqual(payload.to, ['owner@example.com']);
    assert.equal(payload.reply_to, 'ann@example.com');
    assert.match(payload.text, /Hello there/);

    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await post(valid, '10.0.0.9')).status);
    assert.deepEqual(statuses, [200, 200, 200, 429]);
    assert.equal((await post(valid, '10.0.0.10')).status, 200, 'other IPs are unaffected');
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
  }
});

test('brand colours are lightened only as much as needed to stay readable on the page background', () => {
  assert.equal(readableOn('#F7DF1E'), '#f7df1e', 'already readable colours are untouched');
  for (const brand of ['#0C4B33', '#00599C', '#3776AB', '#000000']) {
    const shown = readableOn(brand);
    assert.ok(contrast(shown, '#080808') >= 4.5, `${brand} → ${shown}`);
    assert.ok(contrast(readableOn(brand), '#080808') < 6, `${brand} is not over-lightened (${shown})`);
  }
  const [r, g, b] = [1, 3, 5].map(i => parseInt(readableOn('#0C4B33').slice(i, i + 2), 16));
  assert.ok(g > r && g > b, 'Django keeps its green hue');
});
