import { createContext } from 'react';

// Where the document being shown lives, as an app path with no trailing slash
// ("/patrick/hello-world/lofi"), so its relative links can resolve from there. Null outside a
// prototype document (the Guide's links are all absolute).
export const DocBase = createContext<string | null>(null);
