import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shell = readFileSync(new URL('../src/components/ControlCenterShell.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const screen = readFileSync(new URL('../src/components/FounderBriefing.tsx', import.meta.url), 'utf8');

test('Founder Briefing is an explicitly selected module behind authorized admin shell', () => {
  assert.match(shell, /key: 'briefing'/);
  assert.match(shell, /activeModule === 'briefing'/);
  assert.match(shell, /<FounderBriefing\s*\/>/);
  assert.match(app, /access\.status === 'authorized'/);
  assert.match(app, /<ControlCenterShell/);
  assert.match(app, /adminApi\.getMe\(\)/);
  assert.doesNotMatch(app, /FounderBriefing/);
});

test('The briefing is explicitly a dated, read-only educational snapshot', () => {
  assert.match(screen, /Documentation snapshot — 22 November 2026/);
  assert.match(screen, /not live telemetry or a release dashboard/);
  assert.match(screen, /Cloudflare/);
  assert.match(screen, /Oracle/);
  assert.match(screen, /deterministic FAQ/);
  assert.match(screen, /order is ready/);
  assert.match(screen, /CF2-D/);
  assert.match(screen, /FOUNDER_CHARTER/);
  assert.match(screen, /LOCALEATS_PROJECT_MEMORY/);
  assert.match(screen, /LOCALEATS_SCALABLE_IDEA_REGISTER/);
  assert.doesNotMatch(screen, /\b(?:fetch|axios|localStorage|sessionStorage|dangerouslySetInnerHTML)\s*\(/);
});

test('Existing live shop review path and disabled rider controls are unchanged', () => {
  assert.match(shell, /'shops'\s*\?\s*\(\s*<ShopReviewQueue onAuthorizationFailure/);
  assert.match(shell, /label: 'Riders', icon: Bike, enabled: false/);
  assert.match(shell, /\{ label: 'Overview', icon: LayoutDashboard, enabled: false \}/);
});
