// A preview's document can paint before its module graph loads. Set its existing
// configured mode synchronously; the runtime still validates the full bootstrap.
export function installPreviewTheme(win) {
  try {
    const search = win.location.search;
    if (search.length > 8192) return;
    const params = new URLSearchParams(search);
    if (params.get('studio-preview') !== '1') return;
    const config = JSON.parse(params.get('config') ?? 'null');
    if (!config || typeof config.dark !== 'boolean') return;
    const doc = win.document;
    doc.documentElement.classList.toggle('dark', config.dark);
    const scheme = doc.createElement('meta');
    scheme.name = 'color-scheme';
    scheme.content = config.dark ? 'dark' : 'light';
    const background = doc.createElement('style');
    // Canvas supplies a browser background before CSS arrives. Existing Studio
    // tokens take over afterward; assigned systems still own their view surfaces.
    background.textContent = 'html { background-color: var(--background, Canvas); }';
    doc.head.append(scheme, background);
  } catch { /* Invalid addresses are reported by the preview runtime. */ }
}

export default function previewTheme() {
  return {
    name: 'studio-preview-theme',
    transformIndexHtml: {
      order: 'post',
      handler() {
        return [{ tag: 'script', children: `(${installPreviewTheme.toString()})(window);`, injectTo: 'head-prepend' }];
      },
    },
  };
}
