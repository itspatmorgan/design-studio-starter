import fs from 'node:fs';
import path from 'node:path';
import { frontmatter } from './frontmatter.js';
import { rootOf, addressOf } from '../../src/platform/core/roots.ts';
import { skillTitle } from '../../src/modules/systems/content/skills.ts';

// Match the shared reader's deliberately limited top-level Markdown set.
export function platformReferences({ root, modules, enabled, systemContent }) {
  const related = systemContent.flatMap((section) => section.artifacts.filter((item) => item.path.endsWith('.md')).map((item) => {
    const source = '/' + rootOf(section.contributorKey, section.id) + '/' + item.path;
    const text = fs.readFileSync(path.join(root, 'src', source), 'utf8');
    const prose = text.replace(/```[^\n]*\n[\s\S]*?```/g, '');
    const targets = [...prose.matchAll(/\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)].flatMap((match) => {
      const target = match[1].split('#')[0];
      if (!target || /^(?:[a-z]+:|\/\/)/i.test(target)) return [];
      if (target.startsWith('/documentation/reference/')) return [target.slice('/documentation/reference'.length)];
      if (target.startsWith('/')) return [];
      return [path.posix.normalize(path.posix.join(path.posix.dirname(source), target))];
    });
    const fm = frontmatter(text);
    const title = fm?.title ?? (fm?.name ? skillTitle(fm.name) : text.match(/^#\s+(.+)$/m)?.[1] ?? item.path);
    return { title: `${section.system} · ${section.title} · ${title}`, href: addressOf(section.contributorKey, section.id) + '/' + item.path.replace(/\.md$/, ''), source, targets };
  }));
  const group = (id, label, folder, on, declared = []) => {
    const dir = path.join(root, 'src', folder);
    const references = on && fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith('.md')).sort((a,b) => a.name === 'README.md' ? -1 : b.name === 'README.md' ? 1 : a.name.localeCompare(b.name)).map((entry) => {
      const source = `${folder}/${entry.name}`;
      const text = fs.readFileSync(path.join(dir, entry.name), 'utf8');
      // Every contract retains its canonical document title.
      const fm = frontmatter(text);
      const ownLinks = related.filter(item => item.targets.includes(source) || ((entry.name === 'README.md' || (entry.name === 'reference.md' && !fs.existsSync(path.join(dir, 'README.md')))) && declared.some(d => item.source === `/systems/studio/${d.path}` || item.source.startsWith(`/systems/studio/${d.path.endsWith('/') ? d.path : d.path + '/'}`))));
      return { source, title: fm?.title ?? text.match(/^#\s+(.+)$/m)?.[1] ?? entry.name,
        related: ownLinks.map(({ title, href }) => ({ title, href })),
        ...(id === 'core' ? { section: ['understand', 'operate', 'extend'].includes(fm?.referenceSection) ? fm.referenceSection : 'extend' } : {}),
        ...(id === 'core' && Number.isFinite(fm?.referenceOrder) ? { order: fm.referenceOrder } : {}) };
    }) : [];
    const links = related.filter((item) => item.targets.some((target) => references.some((ref) => target === ref.source)) || declared.some((d) => item.source === `/systems/studio/${d.path}` || item.source.startsWith(`/systems/studio/${d.path.endsWith('/') ? d.path : d.path + '/'}`)));
    return { id, label, enabled: on, references, related: links.map(({ title, href }) => ({ title, href })) };
  };
  return [group('core', 'Platform foundations', '/platform/core', true), {
    id: 'modules', label: 'Module contract', enabled: true,
    references: [{ source: '/modules/README.md', title: 'Module contract', order: 30, section: 'extend', related: related.filter(r => r.targets.includes('/modules/README.md')).map(({title,href}) => ({title,href})) }],
    related: related.filter((r) => r.targets.includes('/modules/README.md')).map(({title,href}) => ({title,href})),
  }, ...modules.slice().sort((a,b) => a.label.localeCompare(b.label)).map((m) => group(m.id, m.label, `/modules/${m.id}`, enabled.includes(m.id), m.instructions))];
}
