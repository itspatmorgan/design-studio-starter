import { test } from 'node:test';
import assert from 'node:assert/strict';
import previewTheme, { installPreviewTheme } from './vite-preview-theme-plugin.js';

function fixture(search) {
  const classes = new Set();
  const nodes = [];
  return {
    classes, nodes,
    location: { search },
    document: {
      documentElement: { classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } } },
      createElement: tag => ({ tag }),
      head: { append: (...values) => nodes.push(...values) },
    },
  };
}
const address = dark => '?' + new URLSearchParams({ 'studio-preview': '1', config: JSON.stringify({ dark }) });

test('preview mode is applied before modules or theme tokens exist', () => {
  for (const dark of [true, false]) {
    const win = fixture(address(dark));
    installPreviewTheme(win);
    assert.equal(win.classes.has('dark'), dark);
    assert.equal(win.nodes[0].name, 'color-scheme');
    assert.equal(win.nodes[0].content, dark ? 'dark' : 'light');
    assert.match(win.nodes[1].textContent, /var\(--background, Canvas\)/);
  }
});

test('ordinary Studio pages and malformed preview addresses are left alone', () => {
  for (const search of ['', '?config={"dark":true}', '?studio-preview=1&config=broken', '?studio-preview=1&config=null', address('dark'), '?studio-preview=1&config=' + 'x'.repeat(8192)]) {
    const win = fixture(search);
    assert.doesNotThrow(() => installPreviewTheme(win));
    assert.equal(win.nodes.length, 0);
    assert.equal(win.classes.size, 0);
  }
});

test('the same self-contained synchronous head bootstrap is used in dev and production', () => {
  const plugin = previewTheme();
  assert.equal(plugin.apply, undefined);
  const [script] = plugin.transformIndexHtml.handler();
  assert.equal(script.injectTo, 'head-prepend');
  assert.equal(script.attrs?.type, undefined);
  const win = fixture(address(true));
  new Function('window', script.children)(win);
  assert.equal(win.classes.has('dark'), true);
});
