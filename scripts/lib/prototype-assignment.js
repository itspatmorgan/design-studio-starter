// Shared by manifest validation and agent context inspection. A rebuild is a
// request, never a substitute for the current runtime assignment.
import { resourceId } from '../../src/platform/core/resourceIdentity.ts';
import { systemKeyFromDeclarations } from '../../src/platform/core/resourceReferences.ts';

export function prototypeAssignment(meta, defaultSystem, systems) {
  let system = null, systemId = null, rebuild;
  const problems = [];
  try {
    systemId = meta.system === undefined ? resourceId(systems[defaultSystem]?.studioId) : meta.system === null ? null : resourceId(meta.system);
    if (meta.systemMissing !== undefined) {
      if (!meta.systemMissing || typeof meta.systemMissing !== 'object' || systemId === null ||
        meta.systemMissing.id !== systemId || typeof meta.systemMissing.label !== 'string' || !meta.systemMissing.label ||
        Object.values(systems).some(spec => spec.studioId === systemId)) throw new Error('invalid systemMissing metadata; retain the deleted ID and label until rebuilt');
      system = systemId; // Retained missing identity, never interpreted as a folder.
    } else if (systemId !== null) system = systemKeyFromDeclarations(systemId, systems);
  } catch (error) { problems.push(`has an invalid system assignment: ${error.message}`); }
  if (meta.rebuild !== undefined) {
    try {
      if (!meta.rebuild || typeof meta.rebuild !== 'object' || Array.isArray(meta.rebuild)) throw new Error('declare rebuild as an object');
      const targetId = meta.rebuild.targetSystem === null ? null : resourceId(meta.rebuild.targetSystem);
      rebuild = { ...meta.rebuild, targetSystem: targetId === null ? null : systemKeyFromDeclarations(targetId, systems), targetSystemId: targetId, source: resourceId(meta.rebuild.source) };
    } catch (error) { problems.push(`has an invalid rebuild request: ${error.message}`); }
  }
  return { system, systemId, rebuild, problems };
}
