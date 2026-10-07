// Keep saved chapter links usable after consolidating the human reference.
const chapters: Record<string, { page: string; hash: string }> = {
  'getting-started': { page: 'questions', hash: 'how-do-i-reopen-or-install-studio' },
  'first-prototype': { page: 'prototypes', hash: 'how-do-i-create-one' },
  'agent-task-context': { page: 'index', hash: 'working-with-your-agent' },
  'agent-context': { page: 'systems', hash: 'where-do-product-knowledge-and-decisions-go' },
  'agent-maintenance': { page: 'systems', hash: 'where-do-product-knowledge-and-decisions-go' },
  'agent-skills': { page: 'systems', hash: 'where-do-product-knowledge-and-decisions-go' },
  'agent-plugin': { page: 'questions', hash: 'how-do-i-reopen-or-install-studio' },
  home: { page: 'questions', hash: 'where-is-my-work' },
  documentation: { page: 'index', hash: 'what-do-you-need-to-know' },
  welcome: { page: 'index', hash: 'two-big-ideas-prototypes-and-systems' },
  documents: { page: 'prototypes', hash: 'how-do-documents-and-diagrams-work' },
  diagrams: { page: 'prototypes', hash: 'how-do-documents-and-diagrams-work' },
  canvases: { page: 'prototypes', hash: 'how-do-canvases-work' },
  collaborate: { page: 'customize', hash: 'how-does-team-access-work' },
};
const anchors: Record<string, Record<string, string>> = {
  prototypes: {
    'artifacts-work-together': 'what-belongs-in-a-prototype',
    'explore-another-system': 'can-i-try-another-appearance-or-system',
    'make-changes-safely': 'how-do-i-organize-artifacts',
    'organize-the-exploration': 'how-do-i-organize-artifacts',
  },
  systems: { 'bring-your-own-system': 'how-do-i-bring-in-my-own-system', 'manage-a-system': 'how-do-i-manage-a-system', 'choose-a-system': 'what-is-a-system', 'what-belongs-in-a-system': 'what-is-a-system', 'review-your-system-in-use': 'what-happens-when-i-change-a-system' },
  customize: { 'configure-the-studio': 'how-do-i-configure-the-studio', 'build-a-module': 'can-my-agent-add-a-feature', 'accept-upstream-updates': 'how-do-i-update-a-customized-studio', 'choose-where-to-work': 'where-should-a-change-go' },
  share: { 'publish-for-review': 'how-do-i-share-a-viewing-link', 'share-the-working-files': 'how-do-teammates-get-my-working-files', 'prepare-an-engineering-handoff': 'what-should-reviewers-or-engineers-receive', 'prepare-for-review': 'what-should-reviewers-or-engineers-receive' },
};

export function manualLinkTarget(slug: string, hash = ''): { page: string; hash: string } | null {
  if (Object.hasOwn(chapters, slug)) {
    if (slug === 'home' && hash === 'working-with-files') return { page: 'questions', hash: 'how-do-i-edit-source' };
    if (slug === 'collaborate' && hash === 'share-through-git') return { page: 'share', hash: 'how-do-teammates-get-my-working-files' };
    return chapters[slug];
  }
  const mapped = Object.hasOwn(anchors, slug) && Object.hasOwn(anchors[slug], hash) ? anchors[slug][hash] : undefined;
  return mapped ? { page: slug, hash: mapped } : null;
}
