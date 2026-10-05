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
const coreDocuments = new Set(['checks', 'source', 'publishing', 'fileTypes', 'diagrams', 'contracts-and-instructions', 'assets', 'stack', 'agent-context', 'config']);
const ownerPath = (id: string) => '/documentation/context/' + id;

export function migratedGuidancePath(path: string): string | null {
  const rule = path.match(/^\/systems\/studio\/rules\/([^/]+?)(?:\.md)?$/);
  if (rule && movedRules[rule[1]]) {
    const target = movedRules[rule[1]];
    return '/documentation/context/' + target;
  }
  const skill = path.match(/^\/systems\/studio\/skills\/([^/]+)(\/.*)?$/);
  if (skill && movedSkills[skill[1]]) return '/documentation/context/' + movedSkills[skill[1]] + (skill[2] ?? '').replace(/\.md$/, '');
  const context = path.match(/^\/systems\/studio\/context\/(principles|personas)(?:\.md)?$/);
  if (context) return ownerPath('platform.core') + '/context/' + context[1];
  if (path === '/systems/marketing/rules/marketing-design' || path === '/systems/marketing/rules/marketing-design.md') return ownerPath('marketing') + '/context/design';
  if (path === '/documentation/reference') return ownerPath('platform.core');
  if (path.startsWith('/documentation/reference/')) {
    const result = markdownPath(path.slice('/documentation/reference'.length));
    return result === path.slice('/documentation/reference'.length) ? null : result;
  }
  if (path.startsWith('/knowledge/')) return path.replace('/knowledge/', '/documentation/context/');
  const system = path.match(/^\/systems\/([^/]+)\/(context|skills)(\/.*)?$/);
  if (system) return ownerPath(system[1]) + '/' + system[2] + (system[3] ?? '').replace(/\.md$/, '');
  return null;
}

// Repository source links and saved reading URLs resolve to the same owner browser.
export function markdownPath(path: string): string {
  const moved = migratedGuidancePath(path);
  if (moved) return moved;
  const chapter = path.match(/^\/modules\/documentation\/pages\/([a-z0-9-]+)\.md$/);
  if (chapter) return '/documentation/guide' + (chapter[1] === 'index' ? '' : '/' + chapter[1]);
  const oldCore = path.match(/^\/platform\/core\/([^/]+)\.md$/);
  if (oldCore && coreDocuments.has(oldCore[1])) return ownerPath('platform.core') + '/context/technical/' + (oldCore[1] === 'fileTypes' ? 'file-types' : oldCore[1]);
  if (path === '/modules/README.md') return ownerPath('platform.core') + '/context/technical/modules';
  const readme = path.match(/^\/(platform|modules\/([^/]+)|systems\/([^/]+))\/README\.md$/);
  if (readme) return ownerPath(readme[1] === 'platform' ? 'platform.core' : readme[2] ? 'module.' + readme[2] : readme[3]);
  const knowledge = path.match(/^\/(platform|modules\/([^/]+)|systems\/([^/]+))\/(context|skills)(\/.*)?$/);
  if (knowledge) return ownerPath(knowledge[1] === 'platform' ? 'platform.core' : knowledge[2] ? 'module.' + knowledge[2] : knowledge[3]) + '/' + knowledge[4] + (knowledge[5] ?? '').replace(/\.md$/, '');
  const contract = path.match(/^\/modules\/([^/]+)\/([^/]+)\.md$/);
  if (contract) return ownerPath('module.' + contract[1]) + (['prototypes','systems'].includes(contract[1]) && contract[2] === 'reference' ? '' : '/reference/' + contract[2] + '.md');
  return path;
}
