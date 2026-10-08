import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidPreference } from '../src/config/appearance.js';
import { readPreferences } from '../src/utils/preferences.js';
const storage = (values = {}) => ({ getItem: (key) => values[key] ?? null });

test('defaults to clay and follows system color preference', () => {
  assert.deepEqual(readPreferences(storage(), true), { designTheme: 'clay', colorMode: 'dark', effects: 'full' });
});
test('migrates the original manual color preference', () => {
  assert.equal(readPreferences(storage({ theme: 'light' }), true).colorMode, 'light');
});
test('restores design, color, and effects independently', () => {
  for (const designTheme of ['glass', 'clay', 'neumorphism']) {
    const saved = { designTheme, colorMode: 'dark', effects: 'reduced' };
    assert.deepEqual(readPreferences(storage({ 'portfolio-appearance': JSON.stringify(saved), theme: 'light' })), saved);
  }
});
test('rejects unknown preference values without discarding valid fields', () => {
  assert.deepEqual(readPreferences(storage({ 'portfolio-appearance': '{"designTheme":"unknown","colorMode":"dark","effects":false}' })),
    { designTheme: 'clay', colorMode: 'dark', effects: 'full' });
});
test('handles corrupt, null, and blocked storage', () => {
  for (const value of ['broken', 'null', '[]']) assert.equal(readPreferences(storage({ 'portfolio-appearance': value })).designTheme, 'clay');
  assert.equal(readPreferences({ getItem() { throw new Error('blocked'); } }, true).colorMode, 'dark');
});

test('settings categories validate their own values and reject unknown keys', () => {
  assert.equal(isValidPreference('designTheme', 'clay'), true);
  assert.equal(isValidPreference('colorMode', 'clay'), false);
  assert.equal(isValidPreference('missing', 'light'), false);
});
