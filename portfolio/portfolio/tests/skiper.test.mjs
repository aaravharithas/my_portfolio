import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fillBento } from '../lib/bento.ts';
import { contactError, parseContact } from '../lib/contact.ts';
import { POST } from '../app/api/contact/route.ts';

const layout = count => fillBento(Array.from({ length: count }, (_, i) => `p${i}`)).tiles.map(tile => `${tile.slot}:${tile.project ?? tile.playground}`);

test('bento fills g, d, h, f, b, a, e, c with projects and gives every other slot its playground tile', () => {
  assert.deepEqual(layout(0), ['g:soon', 'd:role', 'h:stickers', 'f:findme', 'b:stack', 'a:photo', 'e:now', 'c:toolbox']);
  assert.deepEqual(layout(1), ['g:p0', 'd:role', 'h:stickers', 'f:findme', 'b:stack', 'a:photo', 'e:now', 'c:toolbox']);
  assert.deepEqual(layout(3), ['g:p0', 'd:p1', 'h:p2', 'f:findme', 'b:stack', 'a:photo', 'e:now', 'c:toolbox']);
  assert.deepEqual(layout(8), ['g:p0', 'd:p1', 'h:p2', 'f:p3', 'b:p4', 'a:p5', 'e:p6', 'c:p7']);
  assert.deepEqual(fillBento(Array.from({ length: 10 }, (_, i) => i)).extra, [8, 9]);
  assert.deepEqual(fillBento([1]).extra, []);
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
