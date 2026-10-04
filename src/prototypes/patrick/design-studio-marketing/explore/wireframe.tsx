/** @lofi */
import { Button } from '@/systems/marketing/components/button';

export default function LandingWireframe() {
  return <div className="mx-auto max-w-3xl px-6 py-8 text-text-primary">
    <header className="flex flex-wrap items-center justify-between gap-4"><span className="text-lg font-semibold">Design Studio</span><span className="text-sm text-text-tertiary">Human / Agent</span></header>
    <section className="py-12"><h1 className="text-display-md font-medium">A space to make ideas real.</h1><p className="mt-4 text-lg text-text-tertiary">A prototype sandbox for designers and builders.</p><div className="mt-6"><Button href="#install">Get started</Button></div></section>
    <section className="py-8"><h2 className="text-xl font-semibold">Explore an idea</h2><p className="mt-4 text-sm text-text-tertiary">View / Diagram / Canvas / Document</p><div className="mt-4 rounded-lg bg-bg-secondary px-4 py-12 text-center text-sm">Captured product preview</div></section>
    <section id="install" className="py-12"><h2 className="text-xl font-semibold">Run your own studio</h2><p className="mt-3 text-sm text-text-tertiary">Repository link, prerequisite, and terminal commands.</p></section>
    <section className="py-8"><h2 className="text-xl font-semibold">Make it yours</h2><p className="mt-3 text-sm text-text-tertiary">One next step and a setup guide. Project and system references below.</p></section>
  </div>;
}
