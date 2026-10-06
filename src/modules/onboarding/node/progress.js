import fs from 'node:fs';
import path from 'node:path';

// Local, studio-wide first-display state. No request can select a filesystem path.
export function claimWelcome(root) {
  const marker = path.join(root, '.design-studio-welcome-dismissed');
  try {
    const fd = fs.openSync(marker, 'wx');
    fs.closeSync(fd);
    return true;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const stat = fs.lstatSync(marker);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Welcome state must be an ordinary local file.');
    return false;
  }
}
