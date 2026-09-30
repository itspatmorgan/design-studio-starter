// The shape of src/handbook/, which is fixed where the content is open-ended:
//   docs/    Markdown pages, in folders if you like
//   rules/   Markdown pages (AGENTS.md points to them), in folders if you like
//   skills/  one folder per skill, each with a SKILL.md in the Agent Skills format, and any files
//            and folders you want inside it
// The sections are listed in src/studio/roots.ts. Returns the problems, each a sentence that says
// where and what to fix. (Adding a new section is a platform change: add it there first.)
import fs from 'node:fs';
import path from 'node:path';
import { HANDBOOK_SECTIONS } from '../../src/studio/roots.ts';
import { SKILL_FILE, skillProblems } from '../../src/studio/skills.ts';
import { frontmatter } from './frontmatter.js';

const visible = (dir) => fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
const sections = Object.keys(HANDBOOK_SECTIONS);

// Every file under a folder, as paths relative to it.
function* filesUnder(dir, base = '') {
  for (const e of visible(dir)) {
    if (e.isDirectory()) yield* filesUnder(path.join(dir, e.name), `${base}${e.name}/`);
    else if (e.isFile()) yield base + e.name;
  }
}

export function handbookProblems(root) {
  const problems = [];
  const here = (p) => `src/handbook/${p}`;
  for (const e of visible(root)) {
    if (e.isDirectory() && sections.includes(e.name)) continue;
    const where = e.isDirectory() ? `${here(e.name)}/` : here(e.name);
    problems.push(`${where} isn't part of the Handbook's structure. Put it in ${sections.map((s) => `${s}/`).join(', ').replace(/, ([^,]*)$/, ' or $1')}.`);
  }
  for (const id of ['docs', 'rules']) {
    const dir = path.join(root, id);
    if (!fs.existsSync(dir)) continue;
    for (const file of filesUnder(dir)) {
      if (!file.endsWith('.md')) problems.push(`${here(`${id}/${file}`)} isn't a Markdown file. ${id}/ holds Markdown pages only.`);
    }
  }
  const skills = path.join(root, 'skills');
  if (fs.existsSync(skills)) {
    for (const e of visible(skills)) {
      if (!e.isDirectory()) { problems.push(`${here(`skills/${e.name}`)} is loose in skills/. A skill is a folder with a ${SKILL_FILE} in it.`); continue; }
      const file = path.join(skills, e.name, SKILL_FILE);
      if (!fs.existsSync(file)) { problems.push(`${here(`skills/${e.name}/`)} has no ${SKILL_FILE}, so no agent will find the skill. Add one, or move the folder out of skills/.`); continue; }
      problems.push(...skillProblems(e.name, frontmatter(fs.readFileSync(file, 'utf8'))));
    }
  }
  return problems;
}
