// Compatibility routes preserve saved links to guidance moved in the ownership migration.
const movedRules: Record<string, string> = {
  "prototype-workflow": "module.prototypes/skills/build-prototype/SKILL",
  "archiving": "module.prototypes/skills/organize-prototype/SKILL",
  "canvases": "module.canvas/skills/use-canvas/SKILL",
  "documents": "module.document/skills/write-document/SKILL",
  "diagrams": "module.diagrams/skills/create-diagram/SKILL",
  "documentation": "module.documentation/skills/write-guide/SKILL",
  "modules": "platform.core/skills/manage-modules/SKILL",
  "system-content": "platform.core/skills/maintain-context/SKILL",
  "systems": "module.systems/context/authoring",
  "ui-copy": "studio/context/writing",
  "contributor-scope": "platform.core/context/contributor-scope",
  "documentation-standards": "platform.core/context/documentation-standards"
};
const movedSkills: Record<string, string> = {
  "initialize-studio": "platform.core/skills/configure-studio",
  "setup-contributor": "platform.core/skills/setup-contributor",
  "maintain-documentation": "platform.core/skills/maintain-documentation",
  "setup-design-system": "module.systems/skills/setup-design-system",
  "document-component": "module.systems/skills/document-component"
};
export function migratedGuidancePath(path: string): string | null {
  const rule = path.match(/^\/systems\/studio\/rules\/([^/]+?)(?:\.md)?$/);
  if (rule && movedRules[rule[1]]) return (rule[1] === 'ui-copy' ? '/systems/' : '/knowledge/') + movedRules[rule[1]];
  const skill = path.match(/^\/systems\/studio\/skills\/([^/]+)(\/.*)?$/);
  if (skill && movedSkills[skill[1]]) return '/knowledge/' + movedSkills[skill[1]] + (skill[2] ?? '').replace(/\.md$/, '');
  const context = path.match(/^\/systems\/studio\/context\/(principles|personas)(?:\.md)?$/);
  if (context) return '/knowledge/platform.core/context/' + context[1];
  if (path === '/systems/marketing/rules/marketing-design' || path === '/systems/marketing/rules/marketing-design.md') return '/systems/marketing/context/design';
  if (/^\/documentation\/reference\/modules\/(prototypes|systems)\/reference\.md$/.test(path)) return path.replace(/reference\.md$/, 'README.md');
  return null;
}

// Resolve repository Markdown paths to the owning app surface.
export function markdownPath(path: string): string {
  const moved = migratedGuidancePath(path);
  if (moved) return moved;
  const source = path.replace(/^\/documentation\/reference(?=\/)/, '');
  const chapter = source.match(/^\/modules\/documentation\/pages\/([a-z0-9-]+)\.md$/);
  if (chapter) return '/documentation/guide' + (chapter[1] === 'index' ? '' : '/' + chapter[1]);
  const content = source.match(/^\/systems\/([^/]+)\/(context|skills)(\/.*)?$/);
  if (content) return '/systems/' + content[1] + '/' + content[2] + (content[3] ?? '').replace(/\.md$/, '');
  const knowledge = source.match(/^\/(platform|modules\/([^/]+))\/(context|skills)(\/.*)?$/);
  if (knowledge) return '/knowledge/' + (knowledge[1] === 'platform' ? 'platform.core' : 'module.' + knowledge[2]) + '/' + knowledge[3] + (knowledge[4] ?? '').replace(/\.md$/, '');
  if (/^\/(?:platform\/core|modules)\//.test(source) && source.endsWith('.md')) return '/documentation/reference' + source;
  return path;
}
