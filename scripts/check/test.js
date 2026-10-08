// Discover retained platform and module tests so removing an optional module also
// removes its tests from the suite. Prototype experiments are outside this suite.
import { globSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const release = process.argv.includes('--release');
if (process.argv.slice(2).some(arg => arg !== '--release')) throw new Error('Usage: test.js [--release]');
const patterns = ['src/platform/**/*.test.ts', 'src/modules/**/*.test.ts', 'scripts/**/*.test.js'];
if (release) patterns.push('plugins/design-studio/scripts/*.test.mjs');
const files = [...globSync(patterns)].filter(file => release || !file.endsWith('.integration.test.js')).sort();
if (!files.length) throw new Error('No platform tests were found.');
const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
