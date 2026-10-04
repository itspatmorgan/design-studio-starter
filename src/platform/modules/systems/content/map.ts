// The system content's map: in what order an agent reads its instructions, worked out from the files
// themselves so it can't go stale. It reads AGENTS.md (the entry point every agent starts from), the
// rules, and the skills:
//   1. the rules AGENTS.md says to read at the start of every session ("always"),
//   2. the rules it routes to by task ("when asked"), with the sentence that says when,
//   3. the skills, which an agent finds by their descriptions (and AGENTS.md may route to one too).
// A rule that no link reaches is "unrouted": no agent will ever read it. A link to a file that
// isn't there is "missing". This file has no imports, so Node scripts can load it directly.

export type MapInput = {
  root?: string;
  agents: string | null;                       // AGENTS.md's text, or null if there isn't one
  rules: Record<string, string>;               // rule path inside rules/ ("systems.md") → its text
  skills: { folder: string; name: string; description: string }[];
};

export type SystemContentMap = {
  entry: boolean;                              // AGENTS.md exists
  always: string[];                            // rule paths read at the start of every session
  onDemand: { path: string; when: string }[];  // rule paths routed by task
  via: { path: string; from: string }[];       // rules only another rule links to, and that rule
  unrouted: string[];                          // rules nothing links to
  skills: { folder: string; name: string; description: string; when?: string }[];
  missing: string[];                           // AGENTS.md links to SystemContent files that aren't there
};

const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;

// "When the person asks for a canvas (…), read [x](y)." → "the person asks for a canvas (…)".
function whenOf(line: string): string {
  const text = line.replace(LINK, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();
  const m = text.match(/^(?:when|if|whenever)\s+(.*?),?\s*(?:read|follow)\b/i);
  return (m ? m[1] : text).trim();
}

// The directory part of a path ("a/b.md" → "a"), and a relative link resolved against it.
const dirOf = (p: string) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
function resolve(from: string, target: string): string {
  const parts = (dirOf(from) ? dirOf(from).split('/') : []);
  for (const seg of target.split('#')[0].split('/')) {
    if (seg === '..') parts.pop();
    else if (seg && seg !== '.') parts.push(seg);
  }
  return parts.join('/');
}

export function systemContentMap({ agents, rules, skills, root = 'src/systems/platform' }: MapInput): SystemContentMap {
  const RULE = new RegExp('^(?:\\./)?' + root + '/rules/(.+\\.md)(?:#.*)?$');
  const SKILL = new RegExp('^(?:\\./)?' + root + '/skills/([^/]+)/SKILL\\.md(?:#.*)?$');
  const map: SystemContentMap = { entry: agents !== null, always: [], onDemand: [], via: [], unrouted: [], skills: [], missing: [] };
  const skillRoutes = new Map<string, string>();
  const known = new Set(Object.keys(rules));
  const skillFolders = new Set(skills.map((s) => s.folder));
  const seen = new Set<string>();

  let everySession = false;
  for (const line of (agents ?? '').split(/\r?\n/)) {
    const links = [...line.matchAll(LINK)].map((m) => m[1]);
    const list = /^\s*[-*]\s/.test(line);
    // "At the start of every session, read:" opens a list of the rules read every time.
    if (/every session|start of (?:each|every)/i.test(line) && line.trim().endsWith(':')) { everySession = true; continue; }
    if (everySession && !list) everySession = false;
    for (const target of links) {
      const scoped = target.startsWith('src/') ? target : root + '/' + target.replace(/^\.\//, '');
      const rule = scoped.match(RULE)?.[1];
      const skill = scoped.match(SKILL)?.[1];
      if (rule) {
        if (!known.has(rule)) { map.missing.push(`${root}/rules/${rule}`); continue; }
        if (seen.has(rule)) continue;
        seen.add(rule);
        if (everySession && list) map.always.push(rule);
        else map.onDemand.push({ path: rule, when: whenOf(line) });
      } else if (skill) {
        if (!skillFolders.has(skill)) map.missing.push(`${root}/skills/${skill}/SKILL.md`);
        else if (!skillRoutes.has(skill)) skillRoutes.set(skill, whenOf(line));
      }
    }
  }

  // Rules another routed rule links to are reached through it; the rest are unrouted.
  const reached = new Set(seen);
  const queue = [...seen];
  while (queue.length) {
    const from = queue.shift()!;
    for (const m of (rules[from] ?? '').matchAll(LINK)) {
      const target = m[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || !target.split('#')[0].endsWith('.md')) continue;
      const path = resolve(from, target);
      if (known.has(path) && !reached.has(path)) { reached.add(path); map.via.push({ path, from }); queue.push(path); }
    }
  }
  map.unrouted = [...known].filter((p) => !reached.has(p)).sort();
  map.skills = skills.map((s) => ({ ...s, ...(skillRoutes.has(s.folder) ? { when: skillRoutes.get(s.folder) } : {}) }));
  return map;
}
