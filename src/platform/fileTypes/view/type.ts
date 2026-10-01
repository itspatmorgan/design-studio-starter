// A view: a React component in a .tsx or .jsx file, opened as a page in the prototype.
import { defineFileType } from '../index.ts';

// "user-settings.tsx" → UserSettings
function componentName(name: string) {
  const base = name.replace(/\.[jt]sx$/, '');
  const component = base.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('') || 'View';
  return /^[A-Z]/.test(component) ? component : `View${component}`;
}

// Lofi is a comment at the top of the view, above any code: /** @lofi */
const HEADER = /^\uFEFF?(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*)*/;
const TAG = /@lofi\b/;
// A comment that holds only the tag, which goes whole when lofi is switched off.
const ONLY_TAG = /^(\uFEFF?)[ \t]*\/\*\*?[ \t]*@lofi[ \t]*\*\/[ \t]*\r?\n?/;
const isLofi = (source: string) => TAG.test(HEADER.exec(source)?.[0] ?? '');
function setLofi(source: string, on: boolean) {
  const has = isLofi(source);
  if (on) {
    if (has) return source;
    const bom = source.startsWith('\uFEFF') ? '\uFEFF' : '';
    return `${bom}/** @lofi */\n${source.slice(bom.length)}`;
  }
  if (!has) return source;
  if (ONLY_TAG.test(source)) return source.replace(ONLY_TAG, '$1');
  const header = HEADER.exec(source)![0];
  return header.replace(/[ \t]*@lofi\b/, '') + source.slice(header.length);
}

export default defineFileType({
  label: 'View',
  extensions: ['.tsx', '.jsx'],
  language: 'tsx',
  preview: true,
  fidelity: { isLofi, setLofi },

  // It starts as a placeholder (src/lib/placeholder.tsx) until something is built in it.
  template: (name) =>
    `import { Placeholder } from '@/lib/placeholder';\n\nexport default function ${componentName(name)}() {\n  return <Placeholder file={import.meta.url} />;\n}\n`,

  // The app renders a view's default export.
  check: ({ source }) => (/export\s+default\b|export\s*\{[^}]*\bas\s+default\b/.test(source)
    ? []
    : ['a view needs a default export, the component the app renders (export default function MyView() { ... }). Helpers belong in a file or folder named with a leading underscore (_components/).']),
});
