import ts from 'typescript';

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
