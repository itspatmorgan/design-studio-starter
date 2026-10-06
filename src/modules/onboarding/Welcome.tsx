import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { Button } from '@/systems/studio/components/button';
import { Card } from '@/systems/studio/components/card';
import { APP_NAME } from '@/platform/core/api';
import { useManifest } from '@/platform/app/data/useManifest';
import { prototypeLink } from '@/platform/app/data/manifest';
import { complete, progressKey } from './progress';

const firstRequest = 'Help me create my first prototype in this studio. Ask me what I want to explore, then help me choose a design system and get started.';

export default function Welcome() {
  const manifest = useManifest();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const examples = manifest.prototypes.filter(p => p.status !== 'archived' && p.contributorKey === 'patrick' && ['feedback-inbox', 'design-studio-marketing'].includes(p.id));
  const systems = ['product', 'marketing'].filter(id => Object.hasOwn(manifest.systems, id));
  const guide = manifest.guide.some(page => page.slug === 'index');
  const finish = () => {
    complete(progressKey(import.meta.env.BASE_URL));
    void navigate({ to: '/' });
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(firstRequest); setCopied(true); setCopyFailed(false); }
    catch { setCopyFailed(true); }
  };
  return <main className="mx-auto w-full max-w-3xl space-y-7 px-5 py-10 sm:px-8 sm:py-14">
    <header className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Your studio is ready</p>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome to {APP_NAME}</h1>
      <p className="max-w-xl text-base leading-relaxed text-muted-foreground">A place to turn your ideas into something you can try. Explore what’s here, then ask your agent to help you make it your own.</p>
    </header>
    <div className="space-y-4">
      <Card className="gap-3 p-5">
        <h2 className="text-lg font-semibold">1. Try a prototype</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Open an example and click through it. A prototype lets you explore how an idea looks and works.</p>
        <div className="flex flex-wrap gap-2">
          {examples.map(p => <Button key={p.id} variant="outline" render={<Link {...prototypeLink(p)} />}>{p.title}<ArrowRight /></Button>)}
          {!examples.length && <Button variant="outline" render={<Link to={'/prototypes' as never} />}>Browse prototypes<ArrowRight /></Button>}
        </div>
      </Card>
      <Card className="gap-3 p-5">
        <h2 className="text-lg font-semibold">2. Explore your systems</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Systems give your prototypes their components, styles, and product guidance. You can start with the examples and bring your own later.</p>
        <div className="flex flex-wrap gap-2">
          {systems.map(id => <Button key={id} variant="outline" render={<Link to={`/systems/${id}` as never} />}>{id === 'product' ? 'Product system' : 'Marketing system'}<ArrowRight /></Button>)}
          {!systems.length && <Button variant="outline" render={<Link to={'/systems' as never} />}>Browse systems<ArrowRight /></Button>}
        </div>
      </Card>
      <Card className="gap-3 p-5">
        <h2 className="text-lg font-semibold">3. Make something with your agent</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Return to your coding agent’s chat in this studio folder. Tell it what you want to explore, or start with this request:</p>
        <blockquote className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed select-text">{firstRequest}</blockquote>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => void copy()}>{copied ? <Check /> : <Copy />}{copied ? 'Copied' : 'Copy request'}</Button>
          <p aria-live="polite" className="text-xs text-muted-foreground">{copyFailed ? 'Select the request above and copy it into your chat.' : copied ? 'Paste this into your agent’s chat to get started.' : 'Your agent handles the technical steps.'}</p>
        </div>
      </Card>
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-4 pb-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">You can return to Welcome from the sidebar.</p>
        {guide && <Link to={'/documentation/guide' as never} className="text-sm underline underline-offset-4">Read the Guide</Link>}
      </div>
      <Button onClick={finish}>Go to my studio<ArrowRight /></Button>
    </footer>
  </main>;
}
