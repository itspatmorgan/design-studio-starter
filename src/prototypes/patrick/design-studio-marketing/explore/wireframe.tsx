/** @lofi */
import { Button } from '@/systems/marketing/components/button';

export default function LandingWireframe() {
  return <div className="mx-auto max-w-4xl px-6 py-8 text-text-primary">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border-secondary pb-4"><span className="text-lg font-semibold">Design Studio</span><a href="#start" className="text-sm underline">Get started</a></header>
    <section className="py-12"><p className="text-sm text-text-tertiary">Open-source prototype sandbox</p><h1 className="mt-4 text-display-md font-medium">For designers and builders.</h1><p className="mt-4 max-w-2xl text-lg text-text-tertiary">Build with your agent, your components, and your context.</p><div className="mt-6"><Button href="/prototypes/patrick/feedback-inbox">Try the sample</Button></div></section>
    <section className="border-y border-border-secondary py-8"><h2 className="text-xl font-semibold">One idea, connected artifacts</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{['Working view', 'Diagram', 'Canvas', 'Document'].map(label => <div key={label} className="border border-border-primary px-4 py-8 text-sm">{label} — a real example to open</div>)}</div></section>
    <section className="py-8"><h2 className="text-xl font-semibold">Bring your own system</h2><p className="mt-3 text-sm text-text-tertiary">Show which system the prototype uses and what it provides.</p></section>
    <section id="start" className="border-t border-border-secondary py-8"><h2 className="text-xl font-semibold">Start with your agent</h2><p className="mt-3 text-sm text-text-tertiary">Template link, setup prompt, and a short guide.</p></section>
  </div>;
}
