// Discover retained platform and module tests so removing an optional module also
// removes its tests from the suite. Prototype experiments are outside this suite.
import { globSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const files = [...globSync(['src/platform/**/*.test.ts', 'src/modules/**/*.test.ts', 'scripts/**/*.test.js'])].sort();
if (!files.length) throw new Error('No platform tests were found.');
const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
