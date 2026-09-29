import type { ComponentType } from 'react';
import { createLoader } from '@/studio/app/data/createLoader';

// A view file's default export.
export type ViewModule = { default: ComponentType };

// Every view file, .tsx or .jsx, at any depth. Helpers in components/ folders aren't views.
export const views = createLoader<ViewModule>(
  import.meta.glob<ViewModule>(['/prototypes/**/*.{tsx,jsx}', '!/prototypes/**/components/**']),
  import.meta.hot,
);

// Vite runs this file again when a file is added or removed, with the new list (createLoader.ts).
if (import.meta.hot) import.meta.hot.accept();
