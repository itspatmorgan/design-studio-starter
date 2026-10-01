// What a new view shows until something is built in it: a quiet frame that says the view is
// empty, and a prompt to hand your agent. New views and prototypes start with it
// (scripts/vite-files-plugin.js, scripts/templates/prototype/ and tool/).
//
// Agents: replace the <Placeholder /> with the view you build, and remove the import.
//
// It uses only the stock shadcn/ui tokens (background, foreground, muted, border), so it
// fits whichever design system the prototype uses.
import { useState } from 'react';

// The view's path in the repo, like "src/prototypes/patrick/checkout/review.tsx", from
// import.meta.url. Only known in dev; the deployed site bundles files together.
// (Vite serves src/ as its root, so the URL starts at /prototypes/.)
function repoPath(fileUrl: string) {
  const { pathname } = new URL(fileUrl);
  const at = pathname.search(/\/(prototypes|tools)\//);
  return at < 0 ? null : `src${decodeURIComponent(pathname.slice(at))}`;
}

// `tool` is for a tool prototype (scripts/templates/tool/): it asks for something people will use, not look at.
export function Placeholder({ file, tool = false }: { file: string; tool?: boolean }) {
  const path = import.meta.env.DEV ? repoPath(file) : null;
  const prompt = path ? `In ${path}, build ${tool ? 'a tool that ' : ''}` : '';
  const [copied, setCopied] = useState(false);

  return (
    <main className="flex min-h-full items-center justify-center p-8">
      <div className="w-full max-w-md rounded-xl border border-dashed border-border px-8 py-10 text-center">
        <p className="text-sm font-medium text-foreground">This view is empty</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {tool
            ? 'Ask your agent to build the tool here. Describe what it makes and who will use it.'
            : "Ask your agent to build something here. Describe what it's for and who it's for."}
        </p>
        {path && (
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-left">
            {/* The full path is copied; the shorter one (prototype/file) fits the frame. */}
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground" title={prompt}>
              In {path.split('/').slice(path.includes('/tools/') ? 2 : 3).join('/')}, build {tool ? 'a tool that ' : ''}…
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(prompt);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-foreground hover:bg-background"
            >
              {copied ? 'Copied' : 'Copy prompt'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
