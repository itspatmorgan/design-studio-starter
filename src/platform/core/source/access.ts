export class SourceChanged extends Error {}

// Each caller supplies file access and permissions; the editor owns the interaction.
export type SourceAccess = {
  path: string;
  editable: boolean;
  read: () => Promise<{ content: string; version: string }>;
  write: (content: string, base: string) => Promise<{ version: string; warnings?: string[] }>;
};
