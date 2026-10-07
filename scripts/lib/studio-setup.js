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
  const checkNames = (object) => {
    const names = object.properties.map((property) => property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : property.name?.getText(source));
    if (new Set(names).size !== names.length) throw new Error('Remove duplicate configuration properties before configuring the studio.');
  };
  checkNames(object);
  const literal = (value) => {
    if (typeof value === 'boolean') return value ? ts.factory.createTrue() : ts.factory.createFalse();
    if (Array.isArray(value)) return ts.factory.createArrayLiteralExpression(value.map((id) => ts.factory.createStringLiteral(id)));
    if (value && typeof value === 'object') return ts.factory.createObjectLiteralExpression(Object.entries(value).map(([key, next]) => ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(key), literal(next))));
    return ts.factory.createStringLiteral(value);
  };
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const valueText = (value) => printer.printNode(ts.EmitHint.Expression, literal(value), source);
  const edits = [];
  function patchObject(object, values) {
    if (!ts.isObjectLiteralExpression(object) || object.properties.some(ts.isSpreadAssignment)) throw new Error('Configure modules as a plain object without spreads.');
    checkNames(object);
    const remaining = new Map(Object.entries(values));
    for (const property of object.properties) {
      const key = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
      if (!remaining.has(key)) continue;
      if (!ts.isPropertyAssignment(property)) throw new Error(`Configure ${key} as a plain property first.`);
      const value = remaining.get(key); remaining.delete(key);
      if (key !== 'systemMaintainers' && value && typeof value === 'object' && !Array.isArray(value)) patchObject(property.initializer, value);
      else edits.push({ start: property.initializer.getStart(source), end: property.initializer.end, text: valueText(value) });
    }
    if (!remaining.size) return;
    const close = object.end - 1;
    const closeLine = text.slice(text.lastIndexOf('\n', close) + 1, close);
    const fields = [...remaining].map(([key, value]) => `${/^[A-Za-z_]\w*$/.test(key) ? key : JSON.stringify(key)}: ${valueText(value)},`);
    if (/^[ \t]*$/.test(closeLine)) {
      const first = object.properties[0]?.getStart(source) ?? object.getStart(source);
      const firstLine = text.slice(text.lastIndexOf('\n', first) + 1, first);
      const indent = /^[ \t]+$/.test(firstLine) ? firstLine : closeLine + '  ';
      edits.push({ start: close - closeLine.length, end: close - closeLine.length, text: fields.map((field) => indent + field + '\n').join('') });
    } else edits.push({ start: close, end: close, text: ' ' + fields.join(' ') + ' ' });
    const last = object.properties.at(-1);
    if (last && !object.properties.hasTrailingComma) edits.push({ start: last.end, end: last.end, text: ',' });
  }
  patchObject(object, changes);
  return edits.sort((a, b) => b.start - a.start).reduce((result, edit) => result.slice(0, edit.start) + edit.text + result.slice(edit.end), text);
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
