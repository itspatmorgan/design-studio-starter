import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { manualLinkTarget } from './manualLinks.ts';

test('consolidated chapter links and old anchors resolve to existing manual sections', () => {
  for (const slug of ['getting-started','first-prototype','agent-task-context','agent-context','agent-maintenance','agent-skills','agent-plugin','home','documentation','welcome','documents','diagrams','canvases','collaborate']) {
    const target = manualLinkTarget(slug);
    assert(target);
    const source = fs.readFileSync(new URL(`./pages/${target.page}.md`, import.meta.url), 'utf8');
    const anchors = [...source.matchAll(/^## (.+)$/gm)].map(m => m[1].toLowerCase().replace(/[^\w\- ]/g, '').replaceAll(' ', '-'));
    assert(anchors.includes(target.hash), `${slug} -> ${target.hash}`);
  }
  assert.deepEqual(manualLinkTarget('home', 'working-with-files'), {page:'questions',hash:'how-do-i-edit-source'});
  assert.deepEqual(manualLinkTarget('collaborate', 'share-through-git'), {page:'share',hash:'how-do-teammates-get-my-working-files'});
  assert.deepEqual(manualLinkTarget('systems', 'bring-your-own-system'), {page:'systems',hash:'how-do-i-bring-in-my-own-system'});
  assert.equal(manualLinkTarget('systems', 'how-do-i-bring-in-my-own-system'), null, 'canonical links do not redirect again');
  assert.equal(manualLinkTarget('missing'), null);
  assert.equal(manualLinkTarget('constructor'), null);
});
