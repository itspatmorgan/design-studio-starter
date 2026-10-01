// The canvas tools on a canvas file, from the command line, for agents that have no browser:
//
//   pnpm canvas <file.excalidraw> <tool> '<json>'     run a tool on a canvas
//   pnpm canvas help [tool]                            list the tools, or explain one
//
// These are the same tools as the live API in the open canvas (tools.ts), with the same arguments.
// Read the result on stdout; a change is written to the file, and an open canvas takes it in as it
// happens. The file is JSON in, JSON out, so nothing is run from the arguments.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { itemSlug } from '../index.ts';
import { FORMAT_VERSION, stringifyScene } from './slim.ts';
import { help, run, ToolError, type Ctx, type El, type ItemInfo } from './tools.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');

const fail = (message: string): never => { console.error(message); process.exit(1); };

const [first, second, third] = process.argv.slice(2);
if (!first || first === 'help' || first === '--help') {
  console.log(JSON.stringify(help(second), null, 2));
  process.exit(0);
}

// The canvas file, inside a prototype's folder and nowhere else.
const file = path.resolve(process.cwd(), first);
if (!file.endsWith('.excalidraw')) fail(`${first} isn't a canvas. Canvases are .excalidraw files in a prototype.`);
if (!fs.existsSync(file)) fail(`${first} doesn't exist. Make a canvas with + → New canvas in the app, or write an empty one (src/handbook/rules/canvases.md).`);
const real = fs.realpathSync(file);
const TOOLS = path.join(ROOT, 'src', 'tools');
const inTools = fs.existsSync(TOOLS) ? path.relative(fs.realpathSync(TOOLS), real).split(path.sep) : ['..'];
const inProtos = path.relative(fs.realpathSync(PROTOS), real).split(path.sep);
const isTool = inTools[0] !== '..' && !path.isAbsolute(path.relative(TOOLS, real)) && inTools.length >= 2;
if (!isTool && (inProtos[0] === '..' || path.isAbsolute(path.relative(PROTOS, real)) || inProtos.length < 3)) fail(`${first} isn't in a prototype. A canvas is at src/prototypes/<contributor>/<prototype>/….excalidraw (or src/tools/<tool>/….excalidraw).`);
// A tool (src/tools/<id>/) is opened under the reserved key "tools" (src/studio/roots.ts).
const [contributor, prototype] = isTool ? ['tools', inTools[0]] : inProtos;

const tool = second ?? fail('Usage: pnpm canvas <file.excalidraw> <tool> \'<json>\'. Tools: pnpm canvas help');
let args: unknown = {};
try { args = third && third !== '-' ? JSON.parse(third) : third === '-' ? JSON.parse(fs.readFileSync(0, 'utf8')) : {}; } catch (error) { fail(`the arguments aren't valid JSON: ${(error as Error).message}`); }

const text = fs.readFileSync(real, 'utf8');
let scene: { elements?: El[]; appState?: { viewBackgroundColor?: string; gridSize?: number | null }; studioVersion?: number };
try { scene = JSON.parse(text); } catch (error) { fail(`${first} isn't valid JSON: ${(error as Error).message}`); }
if (!Array.isArray(scene!.elements)) fail(`${first} isn't a canvas: it has no list of elements.`);
if ((scene!.studioVersion ?? 1) > FORMAT_VERSION) fail(`${first} was written by a newer copy of the app. Update before changing it.`);

// What the tools need to know about the app: the items in this canvas's prototype, from the manifest.
const manifestFile = path.join(ROOT, 'public', 'prototypes', 'manifest.json');
if (!fs.existsSync(manifestFile)) fail('There is no manifest yet. Run: node scripts/build-manifest.js');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8')) as { prototypes: { contributorKey: string; id: string }[]; tools?: { contributorKey: string; id: string }[] };
const everything = [...manifest.prototypes, ...(manifest.tools ?? [])];
// A prototype's items are in a file of their own (scripts/build-manifest.js).
const itemsOf = (x: { contributorKey: string; id: string }): { path: string; fileType: string }[] => {
  const file = path.join(ROOT, 'public', 'prototypes', 'items', x.contributorKey, `${x.id}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
};
const { FILE_TYPES } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'lib', 'file-types.js')).href) as { FILE_TYPES: Record<string, { label: string; preview?: boolean }> };

const title = (p: string) => itemSlug(p).split('/').pop()!.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const base = `/${contributor}/${prototype}`;
const ctx: Ctx = {
  base,
  item(appPath) {
    // A canvas shows only its own prototype's items.
    if (!appPath.startsWith(`${base}/`)) return null;
    const [c, p, ...slug] = appPath.split('/').filter(Boolean).map(decodeURIComponent);
    const proto = everything.find((x) => x.contributorKey === c && x.id === p);
    const item = proto && itemsOf(proto).find((i) => itemSlug(i.path) === slug.join('/'));
    if (!item) return null;
    const type = FILE_TYPES[item.fileType];
    return { path: appPath, title: title(item.path), type: item.fileType, typeLabel: type?.label ?? 'File', preview: Boolean(type?.preview) };
  },
  items: () => everything
    .filter((x) => x.contributorKey === contributor && x.id === prototype)
    .flatMap((x) => itemsOf(x).map((i) => `/${x.contributorKey}/${x.id}/${itemSlug(i.path)}`))
    .map((p) => ctx.item(p))
    .filter((i): i is ItemInfo => i !== null),
  linkPath: (link) => (link.startsWith('/') && !link.startsWith('//') ? link : null),
};

try {
  const result = run(scene!.elements!, tool, args, ctx);
  if (!['describe', 'help'].includes(tool)) {
    const next = stringifyScene(result.elements, scene!.appState);
    const tmp = `${real}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, next);
    fs.renameSync(tmp, real);
  }
  console.log(JSON.stringify(result.result, null, 2));
} catch (error) {
  if (error instanceof ToolError) fail(error.message);
  throw error;
}
