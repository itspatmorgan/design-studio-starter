// The committed adapter is the vocabulary contract, never the installed package's defaults.
import fs from 'node:fs';
import postcss from 'postcss';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const adapter = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/platform/app/tailwind-theme.css');
export function tailwindThemeProblems(code, { file, themeClass, styling }) {
  if (styling !== 'tailwind') return [];
  const required = new Set();
  postcss.parse(fs.readFileSync(adapter, 'utf8')).walkDecls((decl) => {
    if (decl.parent.type !== 'atrule' || decl.parent.name !== 'theme') return;
    if (decl.prop.startsWith('--container-')) required.add(decl.prop);
    for (const match of decl.value.matchAll(/var\((--[\w-]+)\)/g)) required.add(match[1]);
  });
  const declared = new Map();
  const tree = postcss.parse(code, { from: file });
  // Require unconditional declarations on the boundary. A descendant or dark-only declaration
  // cannot provide a foundation for every component and supported mode.
  tree.walkRules((rule) => {
    if (rule.parent.type !== 'root' || !rule.selector.split(',').some(s => s.trim() === `.${themeClass}`)) return;
    for (const decl of rule.nodes ?? []) if (decl.type === 'decl') declared.set(decl.prop, decl.value);
  });
  const problems = [...required].filter(name => !declared.has(name) || !declared.get(name).trim() || /^(inherit|unset|revert|revert-layer)$/.test(declared.get(name))).map(name => `${file}: declare ${name} on .${themeClass}; Tailwind systems cannot inherit an undeclared foundation.`);
  for (const name of required) {
    for (const match of (declared.get(name) ?? '').matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (match[1] === name || !declared.has(match[1])) problems.push(`${file}: ${name} references ${match[1]} without an independent declaration on .${themeClass}.`);
    }
  }
  return problems;
}
