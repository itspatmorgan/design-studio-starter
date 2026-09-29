// MDX for the Source view's editor: Markdown (with GitHub's tables, task lists, strikethrough,
// and bare links) plus what MDX adds. Frontmatter is YAML, `import` and `export` lines and
// {expressions} are JavaScript, JSX tags are highlighted like tags, and fenced code uses its
// language when it's one we have. It follows MDX rather than plain Markdown in two places:
// there are no HTML blocks (a <Callout> holds Markdown) and no indented code.
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { yamlFrontmatter, yamlLanguage } from '@codemirror/lang-yaml';
import { parseMixed } from '@lezer/common';
import { tags as t } from '@lezer/highlight';
import type { BlockParser, Element, InlineContext, InlineParser, MarkdownConfig } from '@lezer/markdown';

const js = javascript({ jsx: true, typescript: true }).language;

// The end of the balanced {…} that starts at `i` in `s`, or -1. Braces inside strings don't count.
function braceEnd(s: string, i: number): number {
  let depth = 0;
  for (let quote = ''; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i + 1;
  }
  return -1;
}

// A JSX tag at the start of `s` (<Name a="b" c={d}>, </Name>, <>, or <Name />), as the pieces to
// highlight, or null if it isn't one. Attribute values may hold braces, and tags may span lines.
type Piece = [type: string, from: number, to: number];
function scanTag(s: string): { end: number; pieces: Piece[] } | null {
  const pieces: Piece[] = [];
  const skip = (i: number) => { while (i < s.length && /\s/.test(s[i])) i++; return i; };
  const word = (i: number, chars: RegExp) => { let j = i; while (j < s.length && chars.test(s[j])) j++; return j; };
  let i = 1;
  const closing = s[i] === '/';
  if (closing) i++;
  pieces.push(['MdxBracket', 0, i]);
  i = skip(i);
  const nameStart = i;
  i = word(i, /[\w$.-]/);
  if (i > nameStart) {
    if (!/[A-Za-z_$]/.test(s[nameStart])) return null;
    pieces.push(['MdxTagName', nameStart, i]);
  } else if (!(s[i] === '>')) {
    return null; // <> and </> are fragments; anything else needs a name
  }
  if (closing) {
    i = skip(i);
    if (s[i] !== '>') return null;
    pieces.push(['MdxBracket', i, i + 1]);
    return { end: i + 1, pieces };
  }
  for (let guard = 0; i < s.length && guard < 200; guard++) {
    i = skip(i);
    if (s[i] === '>') { pieces.push(['MdxBracket', i, i + 1]); return { end: i + 1, pieces }; }
    if (s[i] === '/' && s[i + 1] === '>') { pieces.push(['MdxBracket', i, i + 2]); return { end: i + 2, pieces }; }
    if (s[i] === '{') { // {...spread}
      const end = braceEnd(s, i);
      if (end < 0) return null;
      pieces.push(['MdxExpression', i, end]);
      i = end;
      continue;
    }
    const attrStart = i;
    i = word(i, /[\w$:.-]/);
    if (i === attrStart || !/[A-Za-z_$]/.test(s[attrStart])) return null;
    pieces.push(['MdxAttributeName', attrStart, i]);
    const afterName = skip(i);
    if (s[afterName] !== '=') continue;
    pieces.push(['MdxBracket', afterName, afterName + 1]);
    i = skip(afterName + 1);
    if (s[i] === '"' || s[i] === "'") {
      const close = s.indexOf(s[i], i + 1);
      if (close < 0) return null;
      pieces.push(['MdxString', i, close + 1]);
      i = close + 1;
    } else if (s[i] === '{') {
      const end = braceEnd(s, i);
      if (end < 0) return null;
      pieces.push(['MdxExpression', i, end]);
      i = end;
    } else {
      return null;
    }
  }
  return null;
}

const jsxTag: InlineParser = {
  name: 'MdxTag',
  before: 'HTMLTag',
  parse(cx: InlineContext, next: number, pos: number) {
    if (next !== 60) return -1; // <
    const tag = scanTag(cx.slice(pos, Math.min(cx.end, pos + 4000)));
    if (!tag) return -1;
    const children: Element[] = tag.pieces.map(([type, from, to]) => cx.elt(type, pos + from, pos + to));
    return cx.addElement(cx.elt('MdxTag', pos, pos + tag.end, children));
  },
};

// {an expression} in text.
const expression: InlineParser = {
  name: 'MdxExpression',
  before: 'Escape',
  parse(cx: InlineContext, next: number, pos: number) {
    if (next !== 123) return -1; // {
    const end = braceEnd(cx.slice(pos, cx.end), 0);
    return end < 0 ? -1 : cx.addElement(cx.elt('MdxExpression', pos, pos + end));
  },
};

// import and export lines, up to the next blank line.
const esm: BlockParser = {
  name: 'MdxEsm',
  before: 'HorizontalRule',
  parse(cx, line) {
    if (!/^(import|export)\s/.test(line.text) || cx.parentType().name !== 'Document') return false;
    const from = cx.lineStart;
    while (cx.nextLine() && line.text.trim() !== '') { /* to the blank line */ }
    cx.addElement(cx.elt('MdxEsm', from, cx.prevLineEnd()));
    return true;
  },
};

const mdx: MarkdownConfig = {
  remove: ['HTMLBlock', 'IndentedCode'],
  defineNodes: [
    { name: 'MdxEsm', block: true },
    'MdxTag',
    'MdxExpression',
    { name: 'MdxTagName', style: t.tagName },
    { name: 'MdxAttributeName', style: t.attributeName },
    { name: 'MdxString', style: t.string },
    { name: 'MdxBracket', style: t.angleBracket },
  ],
  parseBlock: [esm],
  parseInline: [jsxTag, expression],
  wrap: parseMixed((node) => {
    if (node.name === 'MdxEsm') return { parser: js.parser };
    // Inside the braces, not the braces themselves.
    if (node.name === 'MdxExpression' && node.to - node.from > 2) return { parser: js.parser, overlay: [{ from: node.from + 1, to: node.to - 1 }] };
    return null;
  }),
};

// Fenced code in the languages the editor already has.
const codeLanguages = (info: string) => {
  const name = info.trim().split(/\s+/)[0].toLowerCase();
  if (['js', 'jsx', 'javascript', 'ts', 'tsx', 'typescript', 'json'].includes(name)) return js;
  if (name === 'yaml' || name === 'yml') return yamlLanguage;
  return null;
};

// The frontmatter at the top is YAML (lang-yaml's own wrapper); the rest is MDX.
export function mdxLanguage() {
  return yamlFrontmatter({ content: markdown({ base: markdownLanguage, extensions: [mdx], codeLanguages }) });
}
