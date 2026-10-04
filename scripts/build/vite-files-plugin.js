import { SYSTEM_SOURCES } from '../../src/platform/modules/systems/node/systems.js';
import { documentationSources, sourceFile } from './files/source.js';
// The file layer behind the prototype navigation's file tree, during `pnpm dev` only.
// (The deployed site is static, so this doesn't exist there.)
//
//   GET  /__studio/me                                       your contributors.json key and name
//   GET  /__studio/files?contributor=<key>&prototype=<id>   the prototype's files and folders
//        (reserved contributor "system-content" reads a system-owned Context, Rules, or Skills section)
//   GET  /__studio/file?contributor=<key>&prototype=<id>&path=<file>   an item's text and its version
//   POST /__studio/write   { contributor, prototype, path, content, base }  save an item you own, or a system content file (Source view)
//   POST /__studio/reveal   { contributor, prototype, path }  show a file in Finder
//   POST /__studio/op       { contributor, prototype, op, ... }  change files, in your folder only:
//        create   { path: folder, name, dir? }   a new file (from its type's template, by extension) or folder
//        rename   { path, name }
//        move     { path, to: folder }           "" is the prototype's top level
//        delete   { path }                        to the Trash (or .trash/ at the repo root)
//        reorder  { path, to?, before? }         put a file or folder before another in its folder ("before" empty: last), moving it to folder "to" first if given; saved in meta.json "order"
//        meta     { title?, status? }  edit meta.json (status is "active" or "archived")
//        create-skill { name, description }       system content skills only: skills/<name>/SKILL.md, in the Agent Skills format
//      (In the system content, anyone can change files, but only in its fixed shape: src/platform/modules/systems/content/rules.ts.)
//      (contributor "systems" opens a prototype system's components, src/systems/<id>/components/. Anyone can
//      read and save its text files, and it has one operation of its own:
//        add-docs { component }                    the examples and page a component is missing)
//   POST /__studio/prototype { title }   a new prototype in your folder, like pnpm new
//   POST /__studio/prototype-rename { contributor, prototype, title }   retitle a prototype you own; a new title renames its folder too
//   POST /__studio/prototype-delete { contributor, prototype }   move a prototype you own to the Trash
//     It replies with the new path and the updated manifest, so the app can follow a renamed view.
//
// Opening a file in your editor uses Vite's built-in /__open-in-editor.
// When anything under src/prototypes/ is added or removed, it sends "studio:files" with the
// prototypes that changed, so an open file tree refreshes itself.
//
// Requests must come from the app's own page, and every path is checked to stay inside
// the prototype's folder.
//
// This file wires the requests to the pieces in scripts/build/files/: paths.js (where files are, and reading them), policy.js (who
// may change what), ops.js (the changes), and http.js (reading and answering requests).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './files/paths.js';
import { pathToFileURL } from 'node:url';
import { buildManifest } from './build-manifest.js';
import { createPrototype, renamePrototype } from '../../src/platform/modules/prototypes/node/create.js';
import { publishManifest } from './vite-manifest-watch-plugin.js';
import { resolveContributor } from '../cli/resolve-contributor.js';
import { fileTypeOf, systemContentTypeOf } from '../lib/file-types.js';
import { SYSTEM_CONTENT_KEY, SYSTEMS_KEY, contentSection, contentId, SYSTEM_CONTENT_SECTIONS } from '../../src/platform/core/roots.ts';
import { PROTOTYPE_SECTIONS, SERVER_FILES } from '../lib/modules.js';
import { CONTRIBUTORS_DIR, loadContributors } from '../lib/contributors.js';
import { SKILL_FILE, skillProblems } from '../../src/platform/modules/systems/content/skills.ts';
import { frontmatter } from '../lib/frontmatter.js';
import { BATCH_MS, SYSTEM_CONTENT, MAX_SOURCE_BYTES, PROTOS, itemFile, prototypeDir, readTree, resolveInside, systemOf, versionOf } from './files/paths.js';
import { readJson, sameOrigin, send } from './files/http.js';
import { canChange, ownerError, owns } from './files/policy.js';
import { SYSTEM_CONTENT_NOTE, reveal, runOp, runSystemOp, trash } from './files/ops.js';

export default function filesPlugin() {
  return {
    name: 'studio-files',
    apply: 'serve',
    // When a prototype file is moved, created, or deleted, Vite would try to hot-reload it
    // (at its old path, or at a path the page loaded before), fail, and reload the page. The
    // manifest and the item lists (src/platform/modules/<type>/loader.ts) already handle these, so drop Vite's copy of
    // the file itself and let its importers, like those lists, update as usual. Edits to a
    // file are left to Vite's normal hot reload.
    hotUpdate({ type, file, modules }) {
      if (type === 'update' || !(file.startsWith(PROTOS + path.sep) || PROTOTYPE_SECTIONS.some((s) => file.startsWith(s.dir + path.sep)) || file.startsWith(SYSTEM_CONTENT + path.sep) || systemOf(file))) return;
      for (const m of modules) if (m.file === file) this.environment.moduleGraph.invalidateModule(m);
      return modules.filter((m) => m.file !== file);
    },
    async configureServer(server) {
      // The routes the modules add (a server.ts in a module's folder), by module id.
      const moduleServers = Object.fromEntries(await Promise.all(SERVER_FILES.map(async ([id, file]) => [id, (await import(pathToFileURL(file).href)).default])));
      // Who you are, worked out once (it can call the GitHub CLI), and again if contributors.json changes.
      let key;
      const me = () => (key === undefined ? (key = resolveContributor()) : key);
      const identityChanged = (file) => {
        if (path.basename(file) !== 'contributors.json' && path.dirname(file) !== CONTRIBUTORS_DIR) return;
        key = undefined;
        server.ws.send({ type: 'custom', event: 'studio:identity', data: {} });
      };
      for (const event of ['add', 'change', 'unlink']) server.watcher.on(event, identityChanged);

      server.middlewares.use('/__studio', async (req, res, next) => {
        try {
          if (!sameOrigin(req)) return send(res, 403, { error: 'Only the app can use this.' });
          const url = new URL(req.url ?? '/', 'http://localhost');
          if (req.method === 'GET' && url.pathname === '/files') {
            const dir = prototypeDir(url.searchParams.get('contributor'), url.searchParams.get('prototype'));
            if (!dir) return send(res, 404, { error: 'This prototype no longer exists.' });
            return send(res, 200, { files: readTree(dir) });
          }
          if (req.method === 'GET' && url.pathname === '/me') return send(res, 200, { key: me(), name: (me() && loadContributors()[me()]?.name) || null });
          if (req.method === 'GET' && url.pathname === '/file') {
            const dir = prototypeDir(url.searchParams.get('contributor'), url.searchParams.get('prototype'));
            const file = dir && itemFile(dir, url.searchParams.get('path'), url.searchParams.get('contributor'));
            if (!file) return send(res, 404, { error: 'This file no longer exists.' });
            if (fs.statSync(file).size > MAX_SOURCE_BYTES) return send(res, 413, { error: 'This file is too large to show here. Open it in your editor.' });
            const content = fs.readFileSync(file, 'utf8');
            return send(res, 200, { content, version: versionOf(content) });
          }
          if (req.method === 'POST' && url.pathname === '/write') {
            const { contributor, prototype, path: rel, content, base } = await readJson(req);
            const dir = prototypeDir(contributor, prototype);
            const file = dir && itemFile(dir, rel, contributor);
            if (!file) return send(res, 404, { error: 'This file no longer exists.' });
            // Contributor scope: you can change only your own folder (and the system content's, for review).
            if (!canChange(contributor, me(), dir)) return send(res, 403, { error: ownerError(contributor, me()) });
            if (typeof content !== 'string' || Buffer.byteLength(content) > MAX_SOURCE_BYTES) return send(res, 413, { error: 'This file is too large to save here. Keep files under 750 KB.' });
            // Never overwrite a version you haven't seen: if it changed on disk since you opened it, say so.
            if (versionOf(fs.readFileSync(file, 'utf8')) !== base) return send(res, 409, { error: 'This file changed on disk since you opened it.', code: 'changed' });
            fs.writeFileSync(file, content);
            // Saving is never blocked, but a skill that's out of the format is said so now, not at the next build.
            const skill = contributor === SYSTEM_CONTENT_KEY && contentSection(prototype) === 'skills' && rel.split('/').length === 2 && rel.endsWith(`/${SKILL_FILE}`);
            const warnings = skill ? skillProblems(rel.split('/')[0], frontmatter(content)) : [];
            return send(res, 200, { version: versionOf(content), warnings });
          }
          if (req.method === 'POST' && url.pathname === '/op') {
            const body = await readJson(req);
            const dir = prototypeDir(body.contributor, body.prototype);
            if (!dir) return send(res, 404, { error: 'This prototype no longer exists.' });
            // Contributor scope: you can change only your own folder (and the system content's, for review).
            if (!canChange(body.contributor, me(), dir)) return send(res, 403, { error: ownerError(body.contributor, me()) });
            try {
              const result = body.contributor === SYSTEMS_KEY ? runSystemOp(body.prototype, body) : runOp(dir, body, body.contributor === SYSTEM_CONTENT_KEY ? contentSection(body.prototype) : null);
              const { manifest } = buildManifest();
              // Other tabs update now; the tab that asked (X-Studio-Tab) handles it from the reply.
              publishManifest(server, manifest, req.headers['x-studio-tab']);
              return send(res, 200, { ...result, manifest });
            } catch (e) {
              return send(res, 400, { error: e.message });
            }
          }
          if (req.method === 'POST' && url.pathname === '/prototype') {
            const { title } = await readJson(req);
            try {
              const { slug, manifest } = createPrototype({ title, key: me() });
              publishManifest(server, manifest, req.headers['x-studio-tab']);
              return send(res, 200, { contributor: me(), prototype: slug, manifest });
            } catch (e) {
              return send(res, 400, { error: e.message });
            }
          }
          // A route a module adds (its server.ts): POST /__studio/<module>/<route>, for modules that are on.
          const added = req.method === 'POST' ? /^\/([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)$/.exec(url.pathname) : null;
          if (added && Object.hasOwn(moduleServers, added[1]) && Object.hasOwn(moduleServers[added[1]], added[2])) {
            const body = await readJson(req);
            try {
              const result = await moduleServers[added[1]][added[2]]({ me: me(), body });
              if (result.manifest) publishManifest(server, result.manifest, req.headers['x-studio-tab']);
              return send(res, result.status ?? 200, result.body);
            } catch (e) {
              return send(res, 400, { error: e.message });
            }
          }
          if (req.method === 'POST' && url.pathname === '/prototype-rename') {
            const { contributor, prototype, title } = await readJson(req);
            const dir = prototypeDir(contributor, prototype);
            if (!dir) return send(res, 404, { error: 'This prototype no longer exists.' });
            if (contributor === SYSTEM_CONTENT_KEY) return send(res, 403, { error: SYSTEM_CONTENT_NOTE });
            if (!owns(contributor, me(), dir)) return send(res, 403, { error: ownerError(contributor, me()) });
            try {
              const { id, manifest } = renamePrototype({ key: contributor, id: prototype, title });
              publishManifest(server, manifest, req.headers['x-studio-tab']);
              return send(res, 200, { prototype: id, manifest });
            } catch (e) {
              return send(res, 400, { error: e.message });
            }
          }
          if (req.method === 'POST' && url.pathname === '/prototype-delete') {
            const { contributor, prototype } = await readJson(req);
            const dir = prototypeDir(contributor, prototype);
            if (!dir) return send(res, 404, { error: 'This prototype no longer exists.' });
            if (contributor === SYSTEM_CONTENT_KEY) return send(res, 403, { error: SYSTEM_CONTENT_NOTE });
            if (!owns(contributor, me(), dir)) return send(res, 403, { error: ownerError(contributor, me()) });
            const trashedTo = trash(dir);
            const { manifest } = buildManifest();
            publishManifest(server, manifest, req.headers['x-studio-tab']);
            return send(res, 200, { trashedTo, manifest });
          }
          if (req.method === 'POST' && url.pathname === '/system-source') {
            const manifest = buildManifest({ write: false, quiet: true }).manifest;
            const allowed = Object.entries(SYSTEM_SOURCES).flatMap(([id, source]) => [
              source.theme,
              ...(id === 'platform' ? [] : [source.dir + 'system.ts']),
              id === 'platform' ? 'src/platform/modules/systems/pages/platformSystem.tsx' : source.dir + 'intro.tsx',
              ...(manifest.systems[id]?.components ?? []).flatMap((component) => Object.values(component.files).filter(Boolean).map((file) => source.components + '/' + file)),
            ]);
            const result = sourceFile(ROOT, allowed, await readJson(req));
            if (result.reveal) reveal(result.reveal);
            return send(res, result.status ?? 200, result.body);
          }
          if (req.method === 'POST' && url.pathname === '/documentation') {
            const manifest = buildManifest({ write: false, quiet: true }).manifest;
            const allowed = documentationSources(ROOT, manifest);
            const result = sourceFile(ROOT, allowed, await readJson(req));
            if (result.reveal) reveal(result.reveal);
            return send(res, result.status ?? 200, result.body);
          }
          if (req.method === 'POST' && url.pathname === '/reveal') {
            const { contributor, prototype, path: rel } = await readJson(req);
            const dir = prototypeDir(contributor, prototype);
            const file = dir && resolveInside(dir, rel ?? '');
            if (!file) return send(res, 404, { error: 'This file no longer exists.' });
            reveal(file);
            return send(res, 200, { ok: true });
          }
          next();
        } catch (error) {
          server.config.logger.error(`[studio-files] ${error.stack ?? error}`);
          if (res.headersSent) res.destroy();
          else send(res, 500, { error: "Couldn't read or save this file. Check its permissions and try again." });
        }
      });

      // Tell the app which prototypes' (or the system content's) files changed, batched.
      let timer = null;
      const changed = new Set();
      // A file's contributor, prototype, and path in it: a prototype's, the system content's, or a system's components.
      const locate = (file) => {
        for (const [system, source] of Object.entries(SYSTEM_SOURCES)) {
          for (const section of Object.keys(SYSTEM_CONTENT_SECTIONS)) {
            const dir = path.join(ROOT, source.dir, section) + path.sep;
            if (file.startsWith(dir)) return { contributor: SYSTEM_CONTENT_KEY, prototype: contentId(system, section), rel: path.relative(dir, file).split(path.sep).join('/') };
          }
        }
        const system = systemOf(file);
        if (system) return { contributor: SYSTEMS_KEY, prototype: system[0], rel: path.relative(system[1], file).split(path.sep).join('/') };
        const section = PROTOTYPE_SECTIONS.find((s) => file.startsWith(s.dir + path.sep));
        if (section) {
          const [id, ...rest] = path.relative(section.dir, file).split(path.sep);
          return rest.length ? { contributor: section.key, prototype: id, rel: rest.join('/') } : null;
        }
        const [contributor, prototype, ...rest] = path.relative(PROTOS, file).split(path.sep);
        return contributor && !contributor.startsWith('..') && prototype ? { contributor, prototype, rel: rest.join('/') } : null;
      };
      const onEvent = (file) => {
        const at = locate(file);
        if (!at) return;
        const { contributor, prototype } = at;
        changed.add(`${contributor}/${prototype}`);
        clearTimeout(timer);
        timer = setTimeout(() => {
          server.ws.send({ type: 'custom', event: 'studio:files', data: [...changed] });
          changed.clear();
        }, BATCH_MS);
      };
      for (const kind of ['add', 'unlink', 'addDir', 'unlinkDir']) server.watcher.on(kind, onEvent);

      // An item file's text changed on disk (an agent, an editor, or a save from the Source view):
      // an open Source view for it reloads or asks. Not batched: it is one file at a time.
      server.watcher.on('change', (file) => {
        const relative = path.relative(ROOT, file).split(path.sep).join('/');
        if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
          server.ws.send({ type: 'custom', event: 'studio:source', data: { path: relative } });
        }
        const at = locate(file);
        if (!at || !(at.contributor === SYSTEM_CONTENT_KEY || at.contributor === SYSTEMS_KEY ? systemContentTypeOf : fileTypeOf)(at.rel)) return;
        const { contributor, prototype, rel } = at;
        server.ws.send({ type: 'custom', event: 'studio:file', data: { contributor, prototype, path: rel } });
      });
    },
  };
}
