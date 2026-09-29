// Every canvas file in a prototype, as text, for the deployed site. In dev the app reads a canvas
// from the file layer instead (module.tsx), which is always current.
export const canvasFiles = import.meta.glob<string>('/prototypes/**/*.excalidraw', { query: '?raw', import: 'default' });

// Vite runs this file again when a file is added or removed, with the new list.
if (import.meta.hot) import.meta.hot.accept();
