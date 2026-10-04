import { useEffect, useId, useState } from 'react';
import { mermaidTheme } from './mermaidTheme';

// Mermaid has global configuration. Serialize initialization and rendering so diagrams
// in different pages/color modes cannot overwrite each other's configuration mid-render.
let pending: Promise<unknown> = Promise.resolve();
function render(source: string, id: string, dark: boolean) {
  const job = pending.catch(() => undefined).then(async () => {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      look: 'classic',
      themeVariables: mermaidTheme(dark),
      fontFamily: 'Inter, sans-serif',
      suppressErrorRendering: true,
      secure: ['secure', 'securityLevel', 'startOnLoad', 'maxTextSize', 'maxEdges', 'suppressErrorRendering', 'theme', 'themeVariables', 'fontFamily'],
    });
    return (await mermaid.render(id, source)).svg;
  });
  pending = job;
  return job;
}

export function MermaidDiagram({ source, compact = false, fit = false }: { source: string; compact?: boolean; fit?: boolean }) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [result, setResult] = useState<{ svg?: string; error?: string }>({});

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    setResult({});
    render(source, id, dark).then(
      (svg) => { if (active) setResult({ svg }); },
      (error: unknown) => { if (active) setResult({ error: error instanceof Error ? error.message : String(error) }); },
    );
    return () => { active = false; };
  }, [source, id, dark]);

  return (
    <figure className={fit || compact ? `not-prose flex h-full min-h-0 min-w-0 flex-1 flex-col ${compact ? "bg-card p-3" : "bg-background p-6"}` : "not-prose my-6 min-w-0 rounded-lg border border-border bg-card p-4"}>
      {result.svg ? <div className={fit || compact ? "relative min-h-0 min-w-0 flex-1 overflow-hidden [&_svg]:absolute [&_svg]:inset-0 [&_svg]:h-full! [&_svg]:w-full! [&_svg]:max-w-none!" : "overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"} dangerouslySetInnerHTML={{ __html: result.svg }} />
        : result.error ? <div role="alert" className="min-h-0 overflow-auto"><p className="text-sm font-medium">Unable to render Mermaid diagram.</p><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">{result.error}</pre></div>
          : <p role="status" className="text-sm text-muted-foreground">Rendering diagram…</p>}
    </figure>
  );
}
