import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shell=readFileSync(new URL('../src/components/ControlCenterShell.tsx', import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.tsx', import.meta.url),'utf8');
const kit=readFileSync(new URL('../src/components/VendorPitchKit.tsx', import.meta.url),'utf8');

test('Founder vendor pitch remains behind server verified Super Admin shell',()=>{
 assert.match(app,/access\.status === 'authorized'/);
 assert.match(app,/adminApi\.getMe\(\)/);
 assert.match(app,/<ControlCenterShell/);
 assert.match(shell,/key: 'shops'/);
 assert.match(shell,/key: 'vendorPitch'/);
 assert.match(shell,/activeModule === 'vendorPitch'/);
 assert.match(shell,/<VendorPitchKit\s*\/>/);
 assert.match(shell,/useState<ActiveModule>\('shops'\)/);
 assert.match(shell,/label: 'Merchants', icon: Store, enabled: false/);
 assert.match(shell,/label: 'Riders', icon: Bike, enabled: false/);
});

test('Pitch walkthrough uses clearly fictional food and never claims live orders or live signup',()=>{
 assert.match(kit,/TEST sample shop/);
 assert.match(kit,/Fictional pilot example/);
 assert.match(kit,/No checkout, no real shop record, no price quote/);
 assert.match(kit,/public ordering is not live yet/);
 assert.match(kit,/not a live merchant registration system/);
 assert.match(kit,/Founder goal: <strong>90%<\/strong>/);
 assert.match(kit,/Founder goal: <strong>85%<\/strong>/);
 assert.match(kit,/Current planning estimate: <strong>75%<\/strong>/);
 assert.match(kit,/Current planning estimate: <strong>50%<\/strong>/);
 assert.match(kit,/CF2-E backup is blocked/);
 assert.doesNotMatch(kit, /\b(?:fetch|axios|localStorage|sessionStorage|indexedDB|Firebase|supabase)\s*(?:\.|\()/);
 assert.doesNotMatch(kit, /import .*MerchantApi|from ['"].*supabase|dangerouslySetInnerHTML/);
});

test('Pitch provides consent-based interest sheet without automatically collecting contacts',()=>{
 assert.match(kit,/Print blank interest form/);
 assert.match(kit,/window\.print\(\)/);
 assert.match(kit,/Optional permission to contact/);
 assert.match(kit,/solely to follow up about a possible pickup pilot/);
 assert.match(kit,/Store this sheet/);
 assert.match(kit,/not a live LocalEats merchant account/);
 assert.match(kit,/contact details/);
 assert.doesNotMatch(kit,/name="(?:phone|email|shopName)"/);
 assert.doesNotMatch(kit,/onSubmit=|<form|type="submit"/);
});

test('Pitch navigation is accessible and does not alter the original shop approval route',()=>{
 assert.match(kit,/aria-label="Demo progress"/);
 assert.match(kit,/aria-current=\{index === step \? 'step' : undefined\}/);
 assert.match(kit,/disabled=\{step === 0\}/);
 assert.match(kit,/disabled=\{step === DEMO_STEPS.length - 1\}/);
 assert.match(shell,/<ShopReviewQueue onAuthorizationFailure=\{onAuthorizationFailure\}/);
});
