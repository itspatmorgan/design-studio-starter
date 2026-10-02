// Share as card: turns the open feedback into an image to share. The quote, customer, and source come from the
// feedback; you choose how it looks. The drawing code is a copy kept in this prototype (quoteCard.ts).
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/systems/product/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/systems/product/components/dialog';
import { Label } from '@/systems/product/components/label';
import { Tabs, TabsList, TabsTrigger } from '@/systems/product/components/tabs';
import { ACCENTS, FONT, SIZES, STYLES, cardPng, drawCard, type CardSpec, type SizeId, type StyleId } from './quoteCard';
import type { Feedback } from './store';

export default function ShareCardDialog({ item, open, onOpenChange }: { item: Feedback; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [size, setSize] = useState<SizeId>('square');
  const [style, setStyle] = useState<StyleId>('light');
  const [accent, setAccent] = useState('emerald');
  const [fontReady, setFontReady] = useState(false);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const spec: CardSpec = { quote: item.body || item.title, customer: item.customer, source: item.source, size, style, accent };

  useEffect(() => { document.fonts.load(`600 48px ${FONT}`).finally(() => setFontReady(true)); }, []);

  // The canvas exists only while the dialog is open, so the drawing waits for it (a callback ref) and redraws on every choice.
  const draw = (el: HTMLCanvasElement | null) => {
    canvas.current = el;
    if (el && fontReady) drawCard(el, spec);
  };
  useEffect(() => { if (open && canvas.current && fontReady) drawCard(canvas.current, spec); });

  async function download() {
    const url = URL.createObjectURL(await cardPng(spec));
    const who = item.customer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    Object.assign(document.createElement('a'), { href: url, download: `feedback-card${who ? `-${who}` : ''}.png` }).click();
    URL.revokeObjectURL(url);
    onOpenChange(false);
  }

  const { width, height } = SIZES[size];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Share as card</DialogTitle>
          <DialogDescription>A card from this feedback, to share as an image.</DialogDescription>
        </DialogHeader>
        <div className="grid place-items-center rounded-md bg-muted/50 p-4">
          <canvas ref={draw} width={width} height={height} aria-label="Preview of the card" className="max-h-[40vh] max-w-full shadow-md ring-1 ring-foreground/10" style={{ aspectRatio: `${width} / ${height}` }} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Size</Label>
            <Tabs value={size} onValueChange={(v) => setSize(v as SizeId)}>
              <TabsList className="w-full">{(Object.keys(SIZES) as SizeId[]).map((id) => <TabsTrigger key={id} value={id}>{SIZES[id].label}</TabsTrigger>)}</TabsList>
            </Tabs>
          </div>
          <div className="grid gap-1.5">
            <Label>Style</Label>
            <Tabs value={style} onValueChange={(v) => setStyle(v as StyleId)}>
              <TabsList className="w-full">{STYLES.map((s) => <TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>)}</TabsList>
            </Tabs>
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Accent</Label>
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-label={a.label}
                aria-pressed={accent === a.id}
                onClick={() => setAccent(a.id)}
                style={{ background: a.color }}
                className="size-7 outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-foreground"
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={download}>Download PNG</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
