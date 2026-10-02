// How the app opens a canvas: Excalidraw, loaded when the first canvas opens.
import { lazy } from 'react';
import { CanvasIcon } from '@hugeicons/core-free-icons';
import type { FileTypeModule } from '@/platform/app/data/fileTypeModule';
import type { Item, Prototype } from '@/platform/app/data/types';
import { readSource } from '@/platform/app/data/files';
import { canvasFiles } from './loader';

const preload = () => import('./Canvas');
const Canvas = lazy(preload);

export default {
  icon: CanvasIcon,

  async load({ proto, item }) {
    const key = `/prototypes/${proto.contributorKey}/${proto.id}/${item.path}`;
    // Dev reads the file itself, so an agent's changes show; the deployed site has it bundled.
    const [file] = await Promise.all([
      import.meta.env.DEV ? readSource(proto, item.path) : canvasFiles[key]?.().then((content) => ({ content, version: '' })),
      preload(),
    ]);
    return file && { proto, item, text: file.content, version: file.version };
  },

  Page: Canvas,
} satisfies FileTypeModule<{ proto: Prototype; item: Item; text: string; version: string }>;
