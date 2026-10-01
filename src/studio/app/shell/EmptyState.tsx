// The blank slate for a page with nothing on it yet: an icon, what the page is for, and (when there's
// something to do) the steps to fill it. The Prototypes and Tools pages use it.
import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';

export function EmptyState({ icon, title, children, steps }: {
  icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
  title: string;
  children: ReactNode;
  steps?: [title: string, body: string][];
}) {
  return (
    <section className="flex flex-col items-center rounded-xl border border-dashed border-border px-8 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} size={28} />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{children}</p>
      {steps && (
        <ol className="mt-8 grid max-w-2xl gap-6 text-left sm:grid-cols-3">
          {steps.map(([stepTitle, body], i) => (
            <li key={stepTitle} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-xs font-medium text-muted-foreground">{i + 1}</span>
              <span>
                <span className="block text-sm font-medium text-foreground">{stepTitle}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
