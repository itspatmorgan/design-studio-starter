// Every Handbook file that isn't a document, as text, for the deployed site. In dev the app reads a file
// from the file layer instead (module.tsx), which is always current. Images and other binary files
// aren't items (scripts/build/build-manifest.js), so they aren't listed here.
// studioGlobs() is replaced by the list of patterns when Vite reads this file (scripts/build/vite-globs-plugin.js).
export const textFiles = import.meta.glob<string>(studioGlobs(), { query: '?raw', import: 'default' });

// Vite runs this file again when a file is added or removed, with the new list.
if (import.meta.hot) import.meta.hot.accept();
