// Arranges a menu's items into groups, for a divider between them. Items that are false, null, or
// undefined (an action that doesn't apply) are dropped, then groups with nothing left. A group of
// one joins the next, so a short menu isn't cut into lines.
//   menuGroups([[open, reveal], [copyLink, copyPath], [rename], [delete]])  →  [[open, reveal], [copyLink, copyPath], [rename, delete]]
// Has no imports, so it can be tested on its own.
export function menuGroups<T>(groups: (T | false | null | undefined)[][]): T[][] {
  const out: T[][] = [];
  for (const group of groups) {
    const items = group.filter((item): item is T => Boolean(item));
    if (items.length === 0) continue;
    const last = out.at(-1);
    if (last?.length === 1) last.push(...items);
    else out.push(items);
  }
  return out;
}
