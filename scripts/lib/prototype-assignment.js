// Shared by manifest validation and agent context inspection. A rebuild is a
// request, never a substitute for the current runtime assignment.
export function prototypeAssignment(meta, defaultSystem, systems) {
  const system = meta.system === undefined ? defaultSystem : meta.system;
  const problems = [];
  if (meta.systemMissing !== undefined && (!meta.systemMissing || typeof meta.systemMissing !== 'object' ||
    typeof system !== 'string' || meta.systemMissing.id !== system || typeof meta.systemMissing.label !== 'string' ||
    !meta.systemMissing.label || Object.hasOwn(systems, system))) {
    problems.push('has invalid systemMissing metadata; retain the deleted ID and label until the prototype is rebuilt');
  }
  if (!meta.systemMissing && system !== null && !(typeof system === 'string' && Object.hasOwn(systems, system))) {
    problems.push(`has "system": "${system}", which isn't a registered prototype system (${Object.keys(systems).join(', ')})`);
  }
  const rebuild = meta.rebuild;
  if (rebuild !== undefined && (!rebuild || typeof rebuild !== 'object' ||
    !(rebuild.targetSystem === null || typeof rebuild.targetSystem === 'string' && Object.hasOwn(systems, rebuild.targetSystem)) ||
    typeof rebuild.source !== 'string' || !/^src\/prototypes\/[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i.test(rebuild.source))) {
    problems.push('has an invalid rebuild request');
  }
  return { system, rebuild, problems };
}
