import fs from 'node:fs';
import path from 'node:path';

// Copies dist/index.html to dist/404.html after a build. Static hosts that serve
// 404.html for unknown paths (GitHub Pages and others) then still load the app,
// so deep links like /patrick/hello-world work without a rewrite rule.
export default function spa404() {
  let outDir;
  return {
    name: 'spa-404',
    apply: 'build',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); },
    closeBundle() {
      fs.copyFileSync(path.join(outDir, 'index.html'), path.join(outDir, '404.html'));
    },
  };
}
