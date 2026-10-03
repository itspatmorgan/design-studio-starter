import fs from 'node:fs';
import path from 'node:path';
import { frontmatter } from '../../../../../scripts/lib/frontmatter.js';
import { skillTitle } from '../skills.ts';

// Match the shared reader's deliberately limited top-level Markdown set.
export function platformReferences({ root, modules, enabled, handbook }) {
  const related = handbook.flatMap((section) => section.items.filter((item) => item.path.endsWith('.md')).map((item) => {
    const source = `/handbook/${section.id}/${item.path}`;
    const text = fs.readFileSync(path.join(root, 'src', source), 'utf8');
    const targets = [...text.matchAll(/\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)].map((match) => path.posix.normalize(path.posix.join(path.posix.dirname(source), match[1].split('#')[0])));
    const fm = frontmatter(text);
    const title = fm?.title ?? (fm?.name ? skillTitle(fm.name) : text.match(/^#\s+(.+)$/m)?.[1] ?? item.path);
    return { title: `${section.title} · ${title}`, href: source.replace(/\.md$/, ''), source, targets };
  }));
  const group = (id, label, folder, on, declared = []) => {
    const dir = path.join(root, 'src', folder);
    const references = on && fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith('.md')).sort((a,b) => a.name === 'README.md' ? -1 : b.name === 'README.md' ? 1 : a.name.localeCompare(b.name)).map((entry) => {
      const source = `${folder}/${entry.name}`;
      const text = fs.readFileSync(path.join(dir, entry.name), 'utf8');
      return { source, title: frontmatter(text)?.title ?? text.match(/^#\s+(.+)$/m)?.[1] ?? entry.name };
    }) : [];
    const links = related.filter((item) => item.targets.some((target) => references.some((ref) => target === ref.source)) || declared.some((d) => item.source === `/handbook/${d.path}` || item.source.startsWith(`/handbook/${d.path.endsWith('/') ? d.path : d.path + '/'}`)));
    return { id, label, enabled: on, references, related: links.map(({ title, href }) => ({ title, href })) };
  };
  return [group('core', 'Platform foundations', '/platform/core', true), {
    id: 'modules', label: 'Module contract', enabled: true,
    references: [{ source: '/platform/modules/README.md', title: 'Module contract' }],
    related: related.filter((r) => r.targets.includes('/platform/modules/README.md')).map(({title,href}) => ({title,href})),
  }, ...modules.slice().sort((a,b) => a.label.localeCompare(b.label)).map((m) => group(m.id, m.label, `/platform/modules/${m.id}`, enabled.includes(m.id), m.handbook))];
}
