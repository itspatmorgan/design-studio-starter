// Quote card: turns a customer quote into a card to share. Opened from a feedback's Detail screen it arrives
// filled in (?quote=&customer=&source=), and the choices you make are kept in the address so a card can be shared.
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/systems/product/components/button';
import { Checkbox } from '@/systems/product/components/checkbox';
import { Input } from '@/systems/product/components/input';
import { Label } from '@/systems/product/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/systems/product/components/select';
import { Tabs, TabsList, TabsTrigger } from '@/systems/product/components/tabs';
import { Textarea } from '@/systems/product/components/textarea';
import { ACCENTS, FONT, SIZES, STYLES, cardPng, drawCard, type CardSpec, type SizeId, type StyleId } from './_components/draw';
import { fileName } from './_components/text';

const SOURCES = ['Email', 'Chat', 'Interview', 'Survey'];
const NONE = 'none';
const DEFAULTS: CardSpec = { quote: '', customer: '', source: 'Email', size: 'square', style: 'light', accent: 'emerald', showSource: true };

// The starting card: the default, with whatever the address carries. Only known choices are taken.
function fromAddress(): CardSpec {
  const p = new URLSearchParams(location.search);
  const pick = <T extends string>(key: string, allowed: readonly T[], fallback: T) => (allowed.includes(p.get(key) as T) ? (p.get(key) as T) : fallback);
  return {
    quote: p.get('quote') ?? DEFAULTS.quote,
    customer: p.get('customer') ?? DEFAULTS.customer,
    source: p.has('source') ? p.get('source') ?? '' : DEFAULTS.source,
    size: pick<SizeId>('size', Object.keys(SIZES) as SizeId[], DEFAULTS.size),
    style: pick<StyleId>('style', STYLES.map((s) => s.id), DEFAULTS.style),
    accent: pick('accent', ACCENTS.map((a) => a.id), DEFAULTS.accent),
    showSource: p.get('showSource') !== '0',
  };
}

export default function QuoteCard() {
  const [spec, setSpec] = useState<CardSpec>(fromAddress);
  const [fontReady, setFontReady] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const set = <K extends keyof CardSpec>(key: K, value: CardSpec[K]) => setSpec((s) => ({ ...s, [key]: value }));

  // The card's font has to be loaded before the canvas can use it.
  useEffect(() => { document.fonts.load(`600 48px ${FONT}`).finally(() => setFontReady(true)); }, []);

  useEffect(() => { if (canvas.current && fontReady) drawCard(canvas.current, spec); }, [spec, fontReady]);

  // Keep the choices in the address, so the page can be shared or reloaded.
  useEffect(() => {
    const id = setTimeout(() => {
      const p = new URLSearchParams();
      (Object.keys(DEFAULTS) as (keyof CardSpec)[]).forEach((k) => {
        const v = spec[k];
        if (v !== DEFAULTS[k] && v !== '') p.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
      });
      history.replaceState(history.state, '', `${location.pathname}${p.size ? `?${p}` : ''}`);
    }, 300);
    return () => clearTimeout(id);
  }, [spec]);

  const flash = (message: string) => { setStatus(message); setTimeout(() => setStatus(null), 2200); };

  async function download() {
    const url = URL.createObjectURL(await cardPng(spec));
    const a = Object.assign(document.createElement('a'), { href: url, download: fileName(spec) });
    a.click();
    URL.revokeObjectURL(url);
    flash('Downloaded');
  }

  async function copy() {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': cardPng(spec) })]);
      flash('Copied the image');
    } catch {
      flash("Couldn't copy. Download it instead.");
    }
  }

  const size = SIZES[spec.size];

  return (
    <div className="flex h-full min-h-0 bg-background text-foreground">
      <aside className="flex w-88 shrink-0 flex-col border-r border-border">
        <header className="border-b border-border px-5 py-4">
          <h1 className="text-base font-semibold tracking-tight">Quote card</h1>
          <p className="mt-1 text-sm text-muted-foreground">Turn a customer quote into a card to share.</p>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid gap-1.5">
            <Label htmlFor="qc-quote">Quote</Label>
            <Textarea id="qc-quote" rows={6} value={spec.quote} placeholder="What they said, in their words." onChange={(e) => set('quote', e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="qc-customer">Customer</Label>
            <Input id="qc-customer" value={spec.customer} placeholder="Maya Chen" onChange={(e) => set('customer', e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Source</Label>
            <Select
              items={[{ value: NONE, label: 'None' }, ...SOURCES.map((s) => ({ value: s, label: s }))]}
              value={spec.source || NONE}
              onValueChange={(v) => set('source', !v || v === NONE ? '' : v)}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="mt-1 flex items-center gap-2">
              <Checkbox id="qc-show" checked={spec.showSource} onCheckedChange={(v) => set('showSource', v === true)} />
              <Label htmlFor="qc-show">Show where it came from</Label>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Size</Label>
            <Tabs value={spec.size} onValueChange={(v) => set('size', v as SizeId)}>
              <TabsList className="w-full">
                {(Object.keys(SIZES) as SizeId[]).map((id) => <TabsTrigger key={id} value={id}>{SIZES[id].label}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>
          <div className="grid gap-1.5">
            <Label>Style</Label>
            <Tabs value={spec.style} onValueChange={(v) => set('style', v as StyleId)}>
              <TabsList className="w-full">
                {STYLES.map((s) => <TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>
          <div className="grid gap-1.5">
            <Label>Accent</Label>
            <div className="flex gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-label={a.label}
                  aria-pressed={spec.accent === a.id}
                  onClick={() => set('accent', a.id)}
                  style={{ background: a.color }}
                  className="size-7 outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-foreground"
                />
              ))}
            </div>
          </div>
        </div>
        <footer className="flex items-center gap-2 border-t border-border px-5 py-4">
          <Button onClick={download}>Download PNG</Button>
          <Button variant="outline" onClick={copy}>Copy image</Button>
          <span role="status" className="ml-auto text-xs text-muted-foreground">{status}</span>
        </footer>
      </aside>
      <main className="grid min-w-0 flex-1 place-items-center overflow-auto bg-muted/40 p-8">
        <div className="text-center">
          <canvas
            ref={canvas}
            width={size.width}
            height={size.height}
            aria-label="Preview of the card"
            className="mx-auto max-h-[calc(100vh-8rem)] max-w-full shadow-lg ring-1 ring-foreground/10"
            style={{ aspectRatio: `${size.width} / ${size.height}` }}
          />
          <p className="mt-3 text-xs text-muted-foreground">{size.width} × {size.height}</p>
        </div>
      </main>
    </div>
  );
}
