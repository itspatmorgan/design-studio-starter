import fs from 'node:fs';
import path from 'node:path';

export function writeProfiles(root, entries) {
  fs.mkdirSync(path.join(root, 'contributors'), { recursive: true });
  for (const [key, entry] of Object.entries(entries)) {
    fs.writeFileSync(path.join(root, 'contributors', `${key}.json`), JSON.stringify({ github: '', email: '', welcomeDismissed: false, ...entry }, null, 2) + '\n');
  }
}
