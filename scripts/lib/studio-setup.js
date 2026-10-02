import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// Edit only the supported setup properties; preserve all other properties and source comments.
export function editStudioConfig(text, changes) {
  const source = ts.createSourceFile('studio.config.ts', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const exported = source.statements.find(ts.isExportAssignment);
  let object = exported?.expression;
  while (object && (ts.isSatisfiesExpression(object) || ts.isAsExpression(object) || ts.isParenthesizedExpression(object))) object = object.expression;
  if (!object || !ts.isObjectLiteralExpression(object) || source.parseDiagnostics.length) throw new Error('Configuration must default-export an object. Edit custom computed configurations in your editor.');
  if (object.properties.some(ts.isSpreadAssignment)) throw new Error('Configure a plain object without spreads so the applied values are unambiguous.');
  const names = object.properties.map((property) => property.name?.getText(source));
  if (new Set(names).size !== names.length) throw new Error('Remove duplicate configuration properties before configuring the studio.');
  const remaining = new Map(Object.entries(changes));
  const properties = object.properties.map((property) => {
    const key = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
    if (!remaining.has(key)) return property;
    if (!ts.isPropertyAssignment(property)) throw new Error(`Configure ${key} as a plain property first.`);
    const value = remaining.get(key); remaining.delete(key);
    return ts.factory.updatePropertyAssignment(property, property.name, ts.factory.createStringLiteral(value));
  });
  for (const [key, value] of remaining) properties.push(ts.factory.createPropertyAssignment(key, ts.factory.createStringLiteral(value)));
  const updated = ts.factory.updateObjectLiteralExpression(object, properties);
  const result = ts.transform(source, [(context) => {
    const visit = (node) => node === object ? updated : ts.visitEachChild(node, visit, context);
    return (node) => ts.visitNode(node, visit);
  }]);
  try { return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(result.transformed[0]); }
  finally { result.dispose(); }
}

// Preserve existing content's chosen system when the studio's default changes, including disabled modules.
export function pinImplicitSystems(root, system, modules) {
  const directories = (folder) => fs.existsSync(folder) ? fs.readdirSync(folder, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => path.join(folder, entry.name)) : [];
  const personal = directories(path.join(root, 'src/prototypes')).flatMap(directories);
  const sections = modules.filter((module) => module?.section?.items === 'prototypes' && !module.section.byPerson).flatMap((module) => directories(path.join(root, module.section.folder)));
  return [...new Set([...personal, ...sections])].flatMap((folder) => {
    const file = path.join(folder, 'meta.json');
    if (!fs.existsSync(file)) return [];
    if (!fs.lstatSync(file).isFile()) throw new Error(`${file}: metadata must be a regular file.`);
    const before = fs.readFileSync(file, 'utf8');
    let meta;
    try { meta = JSON.parse(before); } catch { throw new Error(`${file}: fix invalid JSON before changing the default system.`); }
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new Error(`${file}: metadata must be an object.`);
    if (meta.system !== undefined) return [];
    return [{ file, before, after: JSON.stringify({ ...meta, system }, null, 2) + '\n' }];
  });
}

// Prepare all reads before applying any changes. Same-folder renames prevent truncated files.
export function applySetupChanges(changes) {
  const atomicWrite = (file, content) => {
    const temporary = `${file}.studio-${randomUUID()}.tmp`;
    try {
      fs.writeFileSync(temporary, content, { flag: 'wx', mode: fs.statSync(file).mode & 0o777 });
      fs.renameSync(temporary, file);
    } finally { fs.rmSync(temporary, { force: true }); }
  };
  for (const change of changes) {
    if (!fs.lstatSync(change.file).isFile() || fs.readFileSync(change.file, 'utf8') !== change.before) throw new Error(`${change.file} changed. Review the setup plan again.`);
  }
  const applied = [];
  try {
    for (const change of changes) { atomicWrite(change.file, change.after); applied.push(change); }
  } catch (error) {
    const failures = [];
    for (const change of applied.reverse()) {
      try { atomicWrite(change.file, change.before); } catch (rollbackError) { failures.push(rollbackError); }
    }
    if (failures.length) throw new AggregateError([error, ...failures], 'Setup failed and some files could not be restored. Inspect the files before retrying.');
    throw error;
  }
}
