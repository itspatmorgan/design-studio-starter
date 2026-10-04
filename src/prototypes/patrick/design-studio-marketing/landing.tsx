import { ArrowRight, Code02, LayersThree01, BookOpen01, ArrowUpRight, InfoCircle, Check } from '@untitledui/icons';
import { Button } from '@/systems/marketing/components/button';
import { Tooltip, TooltipTrigger } from '@/systems/marketing/components/tooltip';

const features = [
  {icon: LayersThree01, title: 'Explore in the right fidelity', text: 'Connect working views, documents, diagrams, and canvases. Keep the thinking alongside the interface.'},
  {icon: Code02, title: 'Build with your real system', text: 'Bring your components and visual language. Prototype with the same building blocks your team uses.'},
  {icon: BookOpen01, title: 'Give your agent the context', text: 'Keep product knowledge, rules, and procedures with your system. Make decisions easier to understand and carry forward.'},
];
const questions = [
  ['What is Design Studio?', 'An open-source starter kit for prototyping with an AI coding agent. Your team owns the code, systems, and supporting context.'],
  ['Can we use our own design system?', 'Yes. Systems have their own components, themes, and guidance. This page uses Marketing; the Feedback Inbox demo uses Product; Studio uses Platform.'],
  ['How does this fit our workflow?', 'Use the coding environment your team already works in. Direct your agent, review working prototypes, and share the files and context with engineering.'],
];
export default function MarketingLanding() {
  return <div className="min-h-full bg-bg-primary font-sans text-text-primary">
    <header className="border-b border-border-secondary">
      <nav aria-label="Marketing" className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <a href="#" className="flex items-center gap-2 text-lg font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-bg-brand-solid text-white"><LayersThree01 className="size-5" /></span>Design Studio</a>
        <div className="flex items-center gap-6"><a href="#features" className="hidden text-sm font-medium text-text-secondary md:block">Why Studio</a><Button href="/documentation/guide" color="secondary">Get started <ArrowUpRight className="inline size-4" /></Button></div>
      </nav>
    </header>
    <main>
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center md:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full bg-bg-brand-secondary px-3 py-1 text-sm font-medium text-text-brand-secondary"><span className="size-2 rounded-full bg-bg-brand-solid" />Your system. Your studio.</span>
        <h1 className="mx-auto mt-6 max-w-3xl text-display-lg font-semibold tracking-tight md:text-display-xl">Turn your thinking<br className="hidden md:block" /> into working software.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-tertiary md:text-xl">A shared space for people and agents to explore ideas, build with real components, and keep the context that makes a prototype useful.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Button href="/prototypes/patrick/feedback-inbox" color="secondary" size="lg">Explore the demo</Button><Button href="/documentation/guide" size="lg" iconTrailing={ArrowRight}>Start building</Button></div>
        <p className="mt-4 text-sm text-text-tertiary">Open source. Built for your team. Owned by you.</p>
        <div className="mt-12 overflow-hidden rounded-xl border border-border-primary bg-bg-secondary p-4 text-left shadow-lg md:p-6" aria-label="An illustration of connected prototype artifacts">
          <div className="flex items-center justify-between gap-4 border-b border-border-secondary pb-4"><span className="text-sm font-semibold">A place for the whole idea</span><Tooltip title="A different system, in the same Studio" description="This page and popup use Marketing. Studio navigation uses Platform." arrow><TooltipTrigger aria-label="About system isolation" className="rounded-full p-1 text-text-tertiary"><InfoCircle className="size-5" /></TooltipTrigger></Tooltip></div>
          <div className="grid gap-4 pt-4 md:grid-cols-3">
            {['Map the flow', 'Build the experience', 'Explain the decisions'].map((title,i)=><div key={title} className="rounded-lg border border-border-secondary bg-bg-primary p-5"><span className="text-xs font-semibold text-text-brand-secondary">0{i+1}</span><h2 className="mt-3 text-md font-semibold">{title}</h2><div className="mt-4 flex flex-col gap-3 text-sm text-text-tertiary">{(i===0?['Capture an idea','Explore the paths','Choose a direction']:i===1?['Your components','A working prototype','Something to discuss']:['Product context','Open questions','Engineering handoff']).map(t=><span key={t} className="flex items-center gap-2"><Check className="size-4 text-text-brand-secondary" />{t}</span>)}</div></div>)}
          </div>
        </div>
      </section>
      <section id="features" className="border-y border-border-secondary bg-bg-secondary py-16">
        <div className="mx-auto max-w-5xl px-6"><p className="text-sm font-semibold text-text-brand-secondary">From idea to shared understanding</p><h2 className="mt-3 text-display-md font-semibold tracking-tight">More than a screen to show.</h2><div className="mt-10 grid gap-10 md:grid-cols-3">{features.map(({icon:Icon,title,text})=><article key={title}><div className="flex size-12 items-center justify-center rounded-lg border border-border-primary bg-bg-primary shadow-xs"><Icon className="size-6 text-text-brand-secondary" /></div><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-3 text-md leading-relaxed text-text-tertiary">{text}</p></article>)}</div></div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16"><h2 className="text-display-sm font-semibold tracking-tight">A few things to know</h2><div className="mt-8">{questions.map(([question,answer])=><details key={question} className="group border-b border-border-secondary py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">{question}<span aria-hidden className="text-text-brand-secondary group-open:rotate-45">+</span></summary><p className="mt-3 text-md leading-relaxed text-text-tertiary">{answer}</p></details>)}</div></section>
      <section className="mx-auto max-w-5xl px-6 pb-16"><div className="rounded-xl bg-bg-brand-secondary px-6 py-12 text-center"><h2 className="text-display-md font-semibold tracking-tight">Bring your next idea.</h2><p className="mt-4 text-lg text-text-tertiary">Give it the system, the space, and the context to grow.</p><div className="mt-6"><Button href="/documentation/guide" size="lg" iconTrailing={ArrowRight}>Make it tangible</Button></div></div></section>
    </main>
    <footer className="border-t border-border-secondary"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-text-tertiary"><span>Design Studio · A starter kit you own.</span><Button href="/systems/marketing" color="link-gray">Built with Marketing <ArrowUpRight className="inline size-4" /></Button></div></footer>
  </div>;
}
