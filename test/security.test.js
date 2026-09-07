const assert = require('node:assert/strict');
const test = require('node:test');

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null;
    return url;
  } catch { return null; }
}

test('affiliate destinations accept only public HTTP(S) URLs', () => {
  assert.equal(safeExternalUrl('https://partner.example/deal')?.hostname, 'partner.example');
  assert.equal(safeExternalUrl('mailto:owner@example.com'), null);
  assert.equal(safeExternalUrl('javascript:alert(1)'), null);
  assert.equal(safeExternalUrl('https://user:pass@partner.example'), null);
});
