import { discoverComponents } from '../../src/modules/systems/docs.ts';
import { snapshotFiles } from './artifact-moves.js';
import fs from 'node:fs';
import path from 'node:path';
import { prototypeAddress, artifactAddress, resourceId, systemAddress } from '../../src/platform/core/resourceIdentity.ts';
import { artifactSlug } from '../../src/platform/core/fileTypes.ts';
import { auditResourceIdentities } from './resource-identity-audit.js';
import { linkedFiles } from './prototype-links.js';
import { rewriteResourceLinks } from './resource-links.js';

// References inside prototype work are migrated once. No compatibility routes
// are installed. Source imports and relative links retain their filesystem role.
export function planResourceLinkMigration(root, types) {
  const audit = auditResourceIdentities(root, types);
  if (audit.problems.length || audit.missing.length) throw new Error('Complete source identity metadata before migrating stored links.');
  const routes = new Map(), prefixes = new Map(), changes = [];
  const prototypes = audit.resources.filter(resource => resource.kind === 'prototype');
  for (const prototype of prototypes) {
    const parent = path.posix.dirname(prototype.path);
    for (const base of [`/prototypes/${prototype.ownerKey}/${prototype.key}`, `/${prototype.ownerKey}/${prototype.key}`]) {
      routes.set(base, prototypeAddress(resourceId(prototype.studioId)));
      for (const artifact of audit.resources.filter(resource => resource.kind === 'artifact' && resource.parent === parent)) {
        const relative = path.posix.relative(parent, artifact.path);
        const destination = artifactAddress(resourceId(prototype.studioId), resourceId(artifact.studioId));
        routes.set(`${base}/${artifactSlug(relative)}`, destination);
        routes.set(`${base}/${relative}`, destination);
      }
    }
  }
  for (const system of audit.resources.filter(resource => resource.kind === 'system')) {
    const before = `/systems/${system.key}`, after = systemAddress(resourceId(system.studioId));
    prefixes.set(before, after);
    const components = discoverComponents([...snapshotFiles(path.join(root, 'src/systems', system.key, 'components')).keys()]);
    for (const component of components) routes.set(`${before}/${component.slug}`, `${after}/components/${component.slug}`);
    if (system.key === 'marketing') routes.set(`${before}/rules/marketing-design`, `${after}/context/design`);
  }
  for (const prototype of prototypes) for (const file of linkedFiles(path.join(root, path.posix.dirname(prototype.path)))) {
    const before = fs.readFileSync(file, 'utf8');
    const after = rewriteResourceLinks(before, file, routes, prefixes);
    if (after !== before) changes.push({ file, before, after });
  }
  return changes;
}
