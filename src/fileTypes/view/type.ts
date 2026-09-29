// A view: a React component in a .tsx or .jsx file, opened as a page in the prototype.
import { defineFileType } from '../index.ts';

// "user-settings.tsx" → UserSettings
function componentName(name: string) {
  const base = name.replace(/\.[jt]sx$/, '');
  const component = base.split(/[^a-z0-9]+/i).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('') || 'View';
  return /^[A-Z]/.test(component) ? component : `View${component}`;
}

export default defineFileType({
  label: 'View',
  extensions: ['.tsx', '.jsx'],

  // It starts as a placeholder (src/lib/placeholder.tsx) until something is built in it.
  template: (name) =>
    `import { Placeholder } from '@/lib/placeholder';\n\nexport default function ${componentName(name)}() {\n  return <Placeholder file={import.meta.url} />;\n}\n`,

  // The app renders a view's default export.
  check: ({ source }) => (/export\s+default\b|export\s*\{[^}]*\bas\s+default\b/.test(source)
    ? []
    : ['a view needs a default export, the component the app renders (export default function MyView() { ... }). Helpers belong in components/.']),
});
