// The picture at the top of a tool's card: a soft two-colour gradient, worked out from the tool's folder name,
// so every tool looks its own without anyone choosing colours. The same name always gives the same card.
// The colours are mixed with the card's own color, so they follow light and dark mode. No browser APIs, so Node can test it.
const hash = (text: string) => {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
};

export function toolHues(id: string): [number, number] {
  const h = hash(id);
  const first = h % 360;
  return [first, (first + 50 + ((h >>> 9) % 70)) % 360];
}

export function toolArt(id: string): { backgroundColor: string; backgroundImage: string } {
  const [a, b] = toolHues(id);
  const tint = (hue: number, amount: number, chroma = 0.16) => `color-mix(in oklch, oklch(0.74 ${chroma} ${hue}) ${amount}%, var(--card))`;
  return {
    backgroundColor: tint(a, 22, 0.08),
    backgroundImage: `radial-gradient(at 18% 24%, ${tint(a, 70)}, transparent 62%), radial-gradient(at 84% 80%, ${tint(b, 64)}, transparent 60%)`,
  };
}
