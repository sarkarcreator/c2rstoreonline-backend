const assert = require('node:assert/strict');
const test = require('node:test');
const { safeExternalUrl } = require('../dist/common/url');

test('affiliate destinations accept only public HTTP(S) URLs', () => {
  assert.equal(safeExternalUrl('https://partner.example/deal')?.hostname, 'partner.example');
  assert.equal(safeExternalUrl('mailto:owner@example.com'), null);
  assert.equal(safeExternalUrl('javascript:alert(1)'), null);
  assert.equal(safeExternalUrl('https://user:pass@partner.example'), null);
});
