// How the app opens a document: a page of Markdown in the app's own style.
import { lazy } from 'react';
import { File01Icon } from '@hugeicons/core-free-icons';
import type { FileTypeModule } from '@/studio/app/data/fileTypeModule';
import { itemFolder, itemSlug } from '@/studio/app/data/manifest';
import { prototypePath } from '@/studio/roots';
import { documents } from './loader';

// Loaded with the first document, so the reader (Markdown provider, table of contents) isn't in
// the main bundle.
const preload = () => import('./DocumentPage');
const DocumentPage = lazy(preload);

export default {
  icon: File01Icon,

  async load({ proto, item }) {
    const file = { contributor: proto.contributorKey, prototype: proto.id, path: item.path };
    const [mod] = await Promise.all([
      documents.load(file, { inManifest: true }).catch((error: unknown) => {
        // A document that doesn't compile shows its error in place, and loads again when it's fixed.
        documents.incomplete.add(file.path);
        return error instanceof Error ? error : new Error(String(error));
      }),
      preload(),
    ]);
    if (!mod) return undefined;
    const app = prototypePath(file.contributor, file.prototype);
    return {
      Component: mod instanceof Error
        ? () => { throw mod; }
        : mod.default,
      frontmatter: (mod instanceof Error ? undefined : mod.frontmatter) ?? {},
      docKey: `${file.contributor}/${file.prototype}/${itemSlug(item.path)}`,
      // The folder the document is in, for its relative links.
      base: itemFolder(item.path) ? `${app}/${itemFolder(item.path)}` : app,
    };
  },

  Page: DocumentPage,
} satisfies FileTypeModule;
