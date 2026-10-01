// A lofi sketch of the feedback inbox, from before it was designed properly. Lofi means grayscale and rough:
// theme colors only, dashed outlines for things that aren't decided, gray bars for text.
const Bar = ({ w }: { w: string }) => <div className="h-2 rounded bg-muted" style={{ width: w }} />;

export default function FeedbackInboxSketch() {
  return (
    <div className="flex min-h-full bg-background text-foreground">
      <aside className="w-48 shrink-0 space-y-3 border-r border-border p-4">
        <Bar w="60%" />
        <div className="space-y-2 pt-3"><Bar w="80%" /><Bar w="70%" /></div>
      </aside>
      <main className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><div className="h-3 w-32 rounded bg-muted-foreground/30" /><Bar w="12rem" /></div>
          <div className="h-8 w-28 rounded border-2 border-dashed border-border" />
        </div>
        <div className="flex gap-2">{['4rem', '3.5rem', '5rem', '4.5rem'].map((w) => <div key={w} className="h-7 rounded-full border-2 border-dashed border-border" style={{ width: w }} />)}</div>
        <div className="divide-y divide-border rounded-lg border-2 border-dashed border-border">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-6 px-4 py-4">
              <div className="flex-1 space-y-2"><Bar w="55%" /><Bar w="30%" /></div>
              <div className="h-5 w-14 rounded-full bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Open question: does the status filter belong above the list or in a sidebar?</p>
      </main>
    </div>
  );
}
