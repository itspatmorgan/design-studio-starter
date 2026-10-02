// Who may change what. Every section of the app has one policy, and the dev server, the scope check on
// pull requests and the app's own buttons all ask here, so they can't disagree:
//   owner        the contributor whose folder it is (a prototype, src/prototypes/<key>/<id>)
//   maintainers  the people listed in the item's meta.json "maintainers" (a shared section item); anyone can use it
//   open         whoever runs the app, because the files are the platform's and a pull request reviews
//                the change (the Handbook, the systems' components)
//   none         nobody, from the app (the Guide)
// A module's section declares its policy (src/platform/core/modules/index.ts); a contributor's key matches no
// module, so it is "owner". The server still checks every request: the app only hides what you can't do.
// Has only type imports, so Node scripts and the app can both load it.
import type { ModuleSpec } from './modules/index.ts';

export type Policy = 'owner' | 'maintainers' | 'open' | 'none';

// What the policy needs to know: who is asking (their contributors.json key, or null), the key the item
// is under, and its maintainers if it has any.
export type Subject = { me: string | null; key: string; maintainers?: readonly string[] };

// meta.json "maintainers" if it's a list of at least one key, else null. Keys repeat nothing.
export const parseMaintainers = (value: unknown): string[] | null => {
  if (!Array.isArray(value) || !value.length) return null;
  if (!value.every((k) => typeof k === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(k))) return null;
  return [...new Set(value as string[])];
};

// Whether `key` (your contributors.json key, or null) is one of these maintainers.
export const canMaintain = (maintainers: readonly string[] | undefined, key: string | null) =>
  Boolean(key && maintainers?.includes(key));

// The policy of the section a key opens: a module's, else "owner" (a contributor's folder).
export function policyFor(key: string, modules: readonly ModuleSpec[]): Policy {
  const section = modules.find((m) => m.section?.key === key)?.section;
  return section ? section.policy ?? 'none' : 'owner';
}

// Whether you own it: its contributor, or one of its maintainers. Owning is what lets you archive,
// delete, publish or unpublish, and it is never true of open files.
export function canOwn(policy: Policy, { me, key, maintainers }: Subject): boolean {
  if (policy === 'owner') return me !== null && key === me;
  if (policy === 'maintainers') return canMaintain(maintainers, me);
  return false;
}

// Whether you may change its files.
export const canChange = (policy: Policy, subject: Subject) => policy === 'open' || canOwn(policy, subject);

// The sentence for why you can't, when you can't.
export function whyNot(policy: Policy, me: string | null): string {
  if (policy === 'none') return "This can't be changed from the app.";
  if (!me) return "You're not set up as a contributor yet. Ask your agent to add you.";
  if (policy === 'maintainers') return 'Only its maintainers can change it.';
  return 'This prototype belongs to someone else. You can change only your own.';
}
