// Offline source-size audit. These explicit profiles are comparison inputs,
// not an instruction resolver, a token counter, or a record of agent reads.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const baseline = ['AGENTS.md', 'src/systems/studio/rules/prototype-workflow.md', 'src/systems/studio/rules/contributor-scope.md'];
const profiles = {
  baseline,
  studioOrientation: [...baseline, 'src/systems/studio/AGENTS.md', 'src/systems/studio/context/principles.md', 'src/systems/studio/context/personas.md'],
  prototypeRuntime: [...baseline, 'src/modules/prototypes/reference.md', 'src/systems/studio/rules/systems.md', 'src/modules/systems/reference.md', 'src/systems/product/AGENTS.md'],
  marketingKnowledge: [...baseline, 'src/systems/marketing/AGENTS.md', 'src/systems/marketing/context/brand.md', 'src/systems/marketing/context/library.md', 'src/systems/marketing/rules/marketing-design.md'],
};
const files = [...new Set(Object.values(profiles).flat())].sort().map(file => {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  return { path: file, bytes: Buffer.byteLength(content), words: content.trim().split(/\s+/).length };
});
const byPath = new Map(files.map(file => [file.path, file]));
const totals = Object.fromEntries(Object.entries(profiles).map(([name, paths]) => [name, {
  paths,
  bytes: paths.reduce((sum, p) => sum + byPath.get(p).bytes, 0),
  words: paths.reduce((sum, p) => sum + byPath.get(p).words, 0),
}]));
console.log(JSON.stringify({
  revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  measurement: 'UTF-8 bytes and whitespace-delimited words; NOT model tokens or observed reads. Profiles omit conditional linked material and implementation files.',
  files, profiles: totals,
}, null, 2));
