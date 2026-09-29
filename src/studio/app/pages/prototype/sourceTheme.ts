// How the Source view's editor looks: the app's own background and text, with syntax colors from
// Flexoki (https://stephango.com/flexoki, MIT, by Steph Ango). Its 600 shades are used in light
// mode and its 400 shades in dark mode, and its guidance for code decides the mapping:
//   keywords green, strings cyan, numbers purple, constants yellow, functions orange,
//   variables and attributes blue, imports red, language features magenta,
//   comments and punctuation quiet.
// The colors are set on the editor only, so there are no new tokens in the app's theme.
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const flexoki = (mode: 'light' | 'dark') => Object.fromEntries(Object.entries({
  red: ['#AF3029', '#D14D41'],
  orange: ['#BC5215', '#DA702C'],
  yellow: ['#AD8301', '#D0A215'],
  green: ['#66800B', '#879A39'],
  cyan: ['#24837B', '#3AA99F'],
  blue: ['#205EA6', '#4385BE'],
  purple: ['#5E409D', '#8B7EC8'],
  magenta: ['#A02F6F', '#CE5D97'],
  comment: ['#878580', '#878580'],
}).map(([name, [light, dark]]) => [`--fx-${name}`, mode === 'light' ? light : dark]));

const layout = EditorView.theme({
  '&': { ...flexoki('light'), height: '100%', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '13px' },
  '.dark &': flexoki('dark'),
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: '1.65' },
  '.cm-content': { caretColor: 'var(--foreground)', padding: '12px 0' },
  '.cm-line': { padding: '0 16px' },
  '.cm-cursor': { borderLeftColor: 'var(--foreground)' },
  '.cm-gutters': { backgroundColor: 'var(--background)', color: 'var(--muted-foreground)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--foreground)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'color-mix(in oklab, var(--fx-blue) 22%, transparent)' },
  '.cm-matchingBracket': { backgroundColor: 'color-mix(in oklab, var(--fx-blue) 22%, transparent)', outline: 'none' },
  '.cm-panels': { backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderColor: 'var(--border)' },
  '.cm-panels input, .cm-panels button': { fontSize: '12px' },
  '.cm-searchMatch': { backgroundColor: 'color-mix(in oklab, var(--fx-yellow) 30%, transparent)' },
});

const quiet = 'var(--muted-foreground)';

// Later rules win over earlier ones where they overlap, so the broad ones come first.
const highlight = HighlightStyle.define([
  { tag: t.quote, color: quiet, fontStyle: 'italic' },
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword], color: 'var(--fx-green)' },
  { tag: t.moduleKeyword, color: 'var(--fx-red)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--fx-cyan)' },
  { tag: [t.regexp, t.escape, t.self, t.character], color: 'var(--fx-magenta)' },
  { tag: t.number, color: 'var(--fx-purple)' },
  { tag: [t.bool, t.null, t.atom, t.constant(t.variableName)], color: 'var(--fx-yellow)' },
  { tag: [t.typeName, t.className, t.namespace], color: 'var(--fx-yellow)' },
  { tag: [t.definition(t.variableName), t.propertyName, t.attributeName], color: 'var(--fx-blue)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: 'var(--fx-orange)' },
  { tag: t.tagName, color: 'var(--fx-magenta)' },
  { tag: [t.operator, t.definitionOperator, t.punctuation, t.separator, t.bracket, t.angleBracket, t.processingInstruction], color: quiet },
  { tag: [t.comment, t.meta], color: 'var(--fx-comment)', fontStyle: 'italic' },
  // Markdown
  { tag: t.heading, fontWeight: '600', color: 'var(--fx-orange)' },
  { tag: t.strong, fontWeight: '600' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: [t.link, t.url], color: 'var(--fx-blue)' },
  { tag: t.monospace, color: 'var(--fx-cyan)' },
  { tag: t.contentSeparator, color: quiet },
  { tag: t.strikethrough, color: quiet, textDecoration: 'line-through' },
  { tag: t.labelName, color: 'var(--fx-yellow)' },
]);

export const sourceTheme = [layout, syntaxHighlighting(highlight)];
