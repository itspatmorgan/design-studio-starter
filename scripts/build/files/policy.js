// Who may change a prototype's files: the policy of its section (src/platform/core/permissions.ts).
// Part of the dev server's file layer (scripts/build/vite-files-plugin.js).
import fs from 'node:fs';
import path from 'node:path';
import { canChange as mayChange, canOwn, parseMaintainers, policyFor, whyNot } from '../../../src/platform/core/permissions.ts';
import { MODULES } from '../../lib/modules.js';

// Who can change a prototype's files is the policy of its section (src/platform/core/permissions.ts): your own
// prototypes; a section item, if you maintain it (its meta.json); the platform's (the Handbook's, and the
// prototype systems' components), which go through review like any change to it.
export const maintainersOf = (dir) => {
  try { return parseMaintainers(JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')).maintainers) ?? []; } catch { return []; }
};
export const policyOf = (contributor) => policyFor(contributor, Object.values(MODULES));
export const subjectOf = (contributor, me, dir) => ({ me, key: contributor, maintainers: policyOf(contributor) === 'maintainers' ? maintainersOf(dir) : undefined });
export const owns = (contributor, me, dir) => canOwn(policyOf(contributor), subjectOf(contributor, me, dir));
export const canChange = (contributor, me, dir) => mayChange(policyOf(contributor), subjectOf(contributor, me, dir));

// Why you can't change a prototype: it's someone else's, you aren't a maintainer, or you aren't set up yet.
export const ownerError = (contributor, me) => whyNot(policyOf(contributor), me);
