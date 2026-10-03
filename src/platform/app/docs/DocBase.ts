import { createContext } from 'react';

// Where the document being shown lives, as an app path with no trailing slash
// ("/patrick/hello-world/lofi"), so its relative links can resolve from there. Null outside a
// document. Repository references use /reference/<source-folder>; Guide chapters use their source folder.
export const DocBase = createContext<string | null>(null);
