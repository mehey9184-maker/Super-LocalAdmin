import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('pickup-only Super Admin preserves shop approvals while Riders are unavailable', () => {
  const shell = load('src/components/ControlCenterShell.tsx');
  assert.match(shell, /label: 'Shop Review', icon: ClipboardCheck, enabled: true, key: 'shops'/);
  assert.match(shell, /label: 'Riders', icon: Bike, enabled: false/);
  assert.match(shell, /Riders: Coming soon/);
  assert.match(shell, /Riders — Coming soon/);
  assert.doesNotMatch(shell, /import\s*\{\s*RiderReviewQueue\s*\}/);
  assert.doesNotMatch(shell, /<RiderReviewQueue/);
  assert.doesNotMatch(shell, /label: 'Riders', icon: Bike, enabled: true/);
});

test('Super Admin identity is not controlled by browser-supplied roles', () => {
  const app = load('src/App.tsx');
  const api = load('src/services/adminApi.ts');
  const config = load('src/config/runtimeConfig.ts');
  assert.match(app, /adminApi\.getMe\(\)/);
  assert.match(api, /currentUser\.getIdToken\(\)/);
  assert.match(api, /\/api\/v1\/admin\/me/);
  assert.match(api, /Authorization/);
  assert.match(config, /EXPECTED_FIREBASE_PROJECT_ID = 'localeats-5e26e'/);
  assert.doesNotMatch(api, /localStorage|sessionStorage|createClient\(/);
});

test('a frontend lock is not server-side security: documented API cutover must stay blocked', () => {
  const doc = load('docs/LOCALEATS_SUPER_ADMIN_PICKUP_AUDIT_20261107.md');
  assert.match(doc, /server-side.*Rider/i);
  assert.match(doc, /actual deployed Firebase rules/i);
  assert.match(doc, /owner approval/i);
});
