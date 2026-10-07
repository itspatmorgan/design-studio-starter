// Explicit working-studio contents. Publishing machinery stays in the source repository.
import fs from 'node:fs';
import path from 'node:path';

const FILES = new Set([
  '.gitignore', '.agents/studio-skills.json', 'AGENTS.md', 'CLAUDE.md', 'README.md',
  'LICENSE', 'CHANGELOG.md', 'CONTRIBUTING.md', 'SECURITY.md', 'components.json',
  'mise.toml', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
  'studio.config.ts', 'studio.lock.json', 'tsconfig.json', 'tsconfig.app.json',
  'tsconfig.node.json', 'vite.config.ts', 'contributors.json',
]);
const FOLDERS = ['contributors/', 'src/', 'public/', 'scripts/', 'patches/', '.agents/skills/', '.claude/skills/', '.husky/'];

export function starterIncludes(file) {
  return !file.startsWith('scripts/eval/') && (FILES.has(file) || FOLDERS.some(folder => file.startsWith(folder)));
}

export function packageStarter(root, files) {
  const selected = new Set(files.filter(starterIncludes));
  const safe = file => {
    if (!file || file.includes('\\') || path.posix.normalize(file) !== file || file.startsWith('/') || file.startsWith('../') || file === '..' || file.split('/').includes('.git')) throw new Error(`Unsafe package path: ${file}`);
    return path.join(root, file);
  };
  // Validate the entire inventory and every selected link before touching staging files.
  for (const file of files) {
    const absolute = safe(file);
    const parent = fs.realpathSync(path.dirname(absolute));
    if (parent !== root && !parent.startsWith(root + path.sep)) throw new Error(`Package parent escapes staging: ${file}`);
    const stat = fs.lstatSync(absolute);
    if (!selected.has(file) || !stat.isSymbolicLink()) continue;
    const target = fs.readlinkSync(absolute);
    const relative = path.relative(root, path.resolve(path.dirname(absolute), target)).split(path.sep).join('/');
    if (path.isAbsolute(target) || ![...selected].some(entry => entry === relative || entry.startsWith(relative + '/'))) throw new Error(`Package link leaves selected contents: ${file}`);
    if (!fs.realpathSync(absolute).startsWith(root + path.sep)) throw new Error(`Package link escapes staging: ${file}`);
  }
  for (const file of files.filter(file => !selected.has(file))) {
    const absolute = safe(file);
    fs.unlinkSync(absolute);
    for (let dir = path.dirname(absolute); dir !== root && fs.readdirSync(dir).length === 0; dir = path.dirname(dir)) fs.rmdirSync(dir);
  }
  // End-user publication validates current source; maintainer regression tests remain explicit.
  const packageFile = path.join(root, 'package.json');
  if (fs.existsSync(packageFile)) {
    const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const build = pkg.scripts?.build;
    if (typeof build === 'string' && build.split(' && ').includes('pnpm test')) {
      pkg.scripts['build:release'] = build;
      pkg.scripts.build = build.split(' && ').filter(step => step !== 'pnpm test').join(' && ');
      fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2) + '\n');
    }
  }
  fs.writeFileSync(path.join(root, 'README.md'), fs.readFileSync(new URL('starter-readme.md', import.meta.url)));
}
