// How the app opens a canvas: Excalidraw, loaded when the first canvas opens.
import { lazy } from 'react';
import { CanvasIcon } from '@hugeicons/core-free-icons';
import type { FileTypeModule } from '@/studio/app/data/fileTypeModule';
import type { Item, Prototype } from '@/studio/app/data/types';
import { readSource } from '@/studio/app/data/files';
import { loadAllItems } from '@/studio/app/data/manifest';
import { canvasFiles } from './loader';

const preload = () => import('./Canvas');
const Canvas = lazy(preload);

export default {
  icon: CanvasIcon,

  async load({ proto, item }) {
    const key = `/prototypes/${proto.contributorKey}/${proto.id}/${item.path}`;
    // Dev reads the file itself, so an agent's changes show; the deployed site has it bundled.
    // A canvas can link to a view in any prototype, so every prototype's items are loaded first (manifest.ts).
    const [file] = await Promise.all([
      import.meta.env.DEV ? readSource(proto, item.path) : canvasFiles[key]?.().then((content) => ({ content, version: '' })),
      preload(),
      loadAllItems(),
    ]);
    return file && { proto, item, text: file.content, version: file.version };
  },

  Page: Canvas,
} satisfies FileTypeModule<{ proto: Prototype; item: Item; text: string; version: string }>;
