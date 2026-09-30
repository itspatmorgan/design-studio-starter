// Archiving: a prototype or a view can be set aside. Everything shows while you work locally; the
// deployed site leaves archived work out entirely (scripts/build-manifest.js --deploy, and
// scripts/vite-archive-plugin.js), so it isn't built, listed, or shipped.
//
// A prototype's status is meta.json "status". A view's is a tag in a comment at the top of its file:
//   /** @status archived */
// A tag in the file travels with it when it's renamed, moved, or copied, and is cheap to read
// without parsing the code. Active is the default and is never written. Has no imports, so Node
// scripts and the app can both load it.
export const STATUSES = ['active', 'archived'] as const;
export type Status = (typeof STATUSES)[number];

export const parseStatus = (value: unknown): Status | null =>
  typeof value === 'string' && (STATUSES as readonly string[]).includes(value) ? (value as Status) : null;

// The comments and blank lines at the top of a file, where the tag is read.
const HEADER = /^\uFEFF?(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*)*/;
const TAG = /@status[ \t]+([^\s*/]+)/;
// A comment that holds only the tag, which is removed whole when the tag goes.
const ONLY_TAG = /^(\uFEFF?)[ \t]*\/\*\*?[ \t]*@status[ \t]+[^\s*/]+[ \t]*\*\/[ \t]*\r?\n?/;

// A file's status from its tag. A value that isn't a status reads as active, with a problem that
// says what to fix.
export function fileStatus(source: string): { status: Status; problem?: string } {
  const value = TAG.exec(HEADER.exec(source)?.[0] ?? '')?.[1];
  if (value === undefined) return { status: 'active' };
  const status = parseStatus(value);
  return status
    ? { status }
    : { status: 'active', problem: `@status "${value}" isn't a status. Use one of: ${STATUSES.join(', ')}.` };
}

// The file's text with its status set. Active removes the tag; archived adds it, or changes the one there.
export function withStatus(source: string, status: Status): string {
  const header = HEADER.exec(source)?.[0] ?? '';
  const has = TAG.test(header);
  if (status === 'active') {
    if (!has) return source;
    if (ONLY_TAG.test(source)) return source.replace(ONLY_TAG, '$1');
    return header.replace(/[ \t]*@status[ \t]+[^\s*/]+/, '') + source.slice(header.length);
  }
  if (has) return header.replace(TAG, `@status ${status}`) + source.slice(header.length);
  const bom = source.startsWith('\uFEFF') ? '\uFEFF' : '';
  return `${bom}/** @status ${status} */\n${source.slice(bom.length)}`;
}

// What the deployed site keeps. An archived prototype is left out whole, and so is one whose views are
// all archived (nothing is left to show). In the others, archived views are left out, and the view a
// prototype opens on falls back to its first if that one is archived. `archived` lists what was left
// out as paths in the app's file globs ("/prototypes/patrick/checkout/lofi/main.tsx", or ".../**" for
// a whole prototype), for scripts/vite-archive-plugin.js.
type Item = { path: string; status?: Status };
type Proto = { id: string; contributorKey: string; items: Item[]; start: string | null; status?: Status };
export function forDeploy<P extends Proto>(prototypes: P[]) {
  const kept: P[] = [];
  const archived: string[] = [];
  const leftOut = { prototypes: 0, views: 0 };
  for (const proto of prototypes) {
    const base = `/prototypes/${proto.contributorKey}/${proto.id}`;
    const live = proto.items.filter((i) => i.status !== 'archived');
    if (proto.status === 'archived' || (live.length === 0 && proto.items.length > 0)) {
      archived.push(`${base}/**`);
      leftOut.prototypes++;
      continue;
    }
    for (const item of proto.items) {
      if (item.status === 'archived') { archived.push(`${base}/${item.path}`); leftOut.views++; }
    }
    kept.push({ ...proto, items: live, start: proto.start && live.some((i) => i.path === proto.start) ? proto.start : null });
  }
  return { kept, archived, leftOut };
}
