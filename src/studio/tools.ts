// Tools: prototypes the team has published. A tool lives in src/tools/<id>/ (the reserved key "tools",
// roots.ts), not under a person, and meta.json "maintainers" lists the contributors.json keys of the
// people who may change it. One maintainer is the usual case; the list leaves room for more. Anyone
// can use a tool and read its files. Has no imports, so Node scripts and the app can both load it.

// meta.json "maintainers" if it's a list of at least one key, else null. Keys repeat nothing.
export const parseMaintainers = (value: unknown): string[] | null => {
  if (!Array.isArray(value) || !value.length) return null;
  if (!value.every((k) => typeof k === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(k))) return null;
  return [...new Set(value as string[])];
};

// Whether `key` (your contributors.json key, or null) may change a tool with these maintainers.
export const canMaintain = (maintainers: readonly string[] | undefined, key: string | null) =>
  Boolean(key && maintainers?.includes(key));
