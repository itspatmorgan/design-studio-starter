import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const portable = JSON.parse(fs.readFileSync(new URL('plugin.json', root), 'utf8'));
const { $schema, extensions, ...identity } = portable;
const { interface: ui, ...openai } = extensions['com.openai'];
const compatibility = { ...identity, skills: './skills/', interface: ui, extensions: { 'com.openai': openai } };
const directory = new URL('.codex-plugin/', root);
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(new URL('plugin.json', directory), JSON.stringify(compatibility, null, 2) + '\n');
console.log(`Updated ${fileURLToPath(new URL('plugin.json', directory))}`);
