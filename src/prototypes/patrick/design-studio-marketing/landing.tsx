import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Copy01, Check } from '@untitledui/icons';
import { Button } from '@/systems/marketing/components/button';
import { Tabs } from '@/systems/marketing/components/tabs';
import viewPreview from './assets/demo-view.jpg';
import diagramPreview from './assets/demo-diagram.jpg';
import canvasPreview from './assets/demo-canvas.jpg';
import documentPreview from './assets/demo-document.jpg';
import styles from './_components/landing.module.css';

const sample = '/prototypes/patrick/feedback-inbox';
const artifacts = [
  { id: 'view', label: 'View', title: 'Try the working interface.', text: 'A feedback inbox built with the Product system. Add an item, change its status, and explore the states.', image: viewPreview, alt: 'Studio displaying the Feedback Inbox interface, with its related artifacts in the navigation.', href: `${sample}/app/feedback-inbox` },
  { id: 'diagram', label: 'Diagram', title: 'Make the flow legible.', text: 'A text-based Mermaid diagram models the feedback review loop. The same source can appear in a document or on a canvas.', image: diagramPreview, alt: 'Studio displaying the feedback review diagram, from recording feedback through review and resolution.', href: `${sample}/explore/feedback-flow` },
  { id: 'canvas', label: 'Canvas', title: 'Give the idea room to move.', text: 'Arrange references and sketches together. This canvas compares a live diagram with an independent, editable drawing.', image: canvasPreview, alt: 'The Breadboard canvas comparing an embedded feedback diagram with editable Excalidraw shapes.', href: `${sample}/explore/breadboard` },
  { id: 'document', label: 'Document', title: 'Keep the reasoning with the work.', text: 'Written context explains the problem and decisions, and references the original diagrams, views, and canvases.', image: documentPreview, alt: 'The Project Context document explaining the feedback prototype and its exploration artifacts.', href: `${sample}/explore/project-context` },
];
const setupPrompt = 'Help me set up this Design Studio starter. Read the repository’s README and AGENTS.md first. Get it running locally, then help me configure my studio, contributor identity, and design system. Start by asking what I want to prototype.';
const questions = [
  ['What do I need to use it?', 'A local copy of the starter and a coding agent. Open the repository in the coding environment you use, then follow the setup guide. You can explore the sample before changing the configuration.'],
  ['Can I bring my own system?', 'Yes. Each prototype can use an explicitly assigned system with its own components, theme, and context. Product and Marketing are two included examples.'],
  ['What do I own?', 'The repository: your prototypes, systems, context, and the Studio itself. Artifacts are ordinary files that you and your agent can read, edit, and share.'],
];
function StudioMark() {
  return <svg viewBox="0 0 40 32" className="h-8 w-10" aria-hidden="true" fill="currentColor"><path d="M0 0h11v32H0zM15 0h3a16 16 0 0 1 0 32h-3z" /></svg>;
}
function Setup() {
  const [status, setStatus] = useState('');
  async function copyPrompt() {
    try { await navigator.clipboard.writeText(setupPrompt); setStatus('Prompt copied. Paste it into your coding agent.'); }
    catch { setStatus('Copy the prompt text below and paste it into your coding agent.'); }
  }
  return <section id="start" className="mx-auto max-w-5xl px-6 py-16">
    <div className="grid gap-8 md:grid-cols-2">
      <div><p className={styles.eyebrow}>Make it yours</p><h2 className="mt-3 text-display-sm font-medium tracking-tight">Start with your agent.</h2><p className="mt-4 text-md leading-relaxed text-text-tertiary">Create your own copy of the starter, open it in your coding environment, and let your agent help with setup. Bring your system when you are ready.</p><div className="mt-6 flex flex-wrap gap-4"><Button href="https://github.com/itspatmorgan/design-studio-starter" target="_blank" rel="noreferrer" iconTrailing={ArrowUpRight}>Get the starter</Button><Button href="/documentation/guide/getting-started" color="link-gray">Read the setup guide</Button></div></div>
      <div className="rounded-lg border border-border-primary bg-bg-secondary p-6"><p className="text-sm font-semibold">A first prompt</p><p className="mt-4 text-md leading-relaxed text-text-secondary">{setupPrompt}</p><div className="mt-6"><Button color="secondary" onPress={copyPrompt} iconLeading={status.startsWith('Prompt copied') ? Check : Copy01}>Copy setup prompt</Button></div><p role="status" className="mt-3 text-sm text-text-tertiary">{status}</p></div>
    </div>
  </section>;
}
export default function MarketingLanding() {
  return <div className="min-h-full bg-bg-primary font-sans text-text-primary">
    <header className="border-b border-border-secondary"><nav aria-label="Marketing" className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
      <a href="#" className="flex items-center gap-3 text-lg font-semibold"><StudioMark />Design Studio</a>
      <div className="flex items-center gap-6"><a href="#demo" className="hidden text-sm font-medium text-text-secondary sm:block">Explore</a><Button href="#start" color="secondary">Get started <ArrowUpRight className="inline size-4" /></Button></div>
    </nav></header>
    <main>
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-10 text-center md:pt-16">
        <p className={styles.eyebrow}>Open source. A space to make things.</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-display-md font-medium tracking-tight md:text-display-lg">A prototype sandbox<br className="hidden sm:block" /> for designers and builders.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-text-tertiary">Design with your coding agent, using your team’s components. Keep the working prototype, diagrams, and decisions together.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3"><Button href={sample} size="lg" iconTrailing={ArrowRight}>Try the sample</Button><Button href="#start" color="secondary" size="lg">Start your studio</Button></div>
      </section>
      <section id="demo" className="mx-auto max-w-5xl px-6 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border-secondary pt-8"><div><p className={styles.eyebrow}>One idea, connected artifacts</p><h2 className="mt-3 text-display-sm font-medium tracking-tight">See the work from every side.</h2></div><span className="text-sm text-text-tertiary">An actual prototype. Four ways in.</span></div>
        <Tabs defaultSelectedKey="view" className="mt-8">
          <Tabs.List aria-label="Explore the sample artifacts">{artifacts.map(item => <Tabs.Item key={item.id} id={item.id}>{item.label}</Tabs.Item>)}</Tabs.List>
          {artifacts.map(item => <Tabs.Panel key={item.id} id={item.id} className="pt-5">
            <figure className="overflow-hidden rounded-lg border border-border-primary bg-bg-secondary"><img src={item.image} alt={item.alt} className={styles.preview} width={item.id === 'document' ? 1456 : 1280} height={item.id === 'document' ? 799 : 720} /><figcaption className="flex flex-wrap items-center justify-between gap-4 border-t border-border-secondary px-4 py-3"><span className="text-xs text-text-tertiary">Captured preview · Feedback Inbox sample</span><Button href={item.href} color="link-gray" iconTrailing={ArrowUpRight}>Open {item.label.toLowerCase()}</Button></figcaption></figure>
            <div className="mt-5 grid gap-3 md:grid-cols-2"><h3 className="text-xl font-semibold">{item.title}</h3><p className="text-md leading-relaxed text-text-tertiary">{item.text}</p></div>
          </Tabs.Panel>)}
        </Tabs>
      </section>
      <section className="border-y border-border-secondary bg-bg-secondary py-12">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-2">
          <div><p className={styles.eyebrow}>Your components. Your context.</p><h2 className="mt-3 text-display-sm font-medium tracking-tight">A system that feels like you.</h2><p className="mt-4 text-md leading-relaxed text-text-tertiary">A system holds more than UI. Its theme, components, context, rules, and skills give your agent the building blocks and guidance for your work.</p><p className="mt-4 text-md leading-relaxed text-text-tertiary">This marketing page and the product demo use different systems. Studio provides the shared tools around both.</p></div>
          <div className="grid gap-4 sm:grid-cols-2"><a href="/systems/marketing" className={styles.systemCard}><span className={styles.systemName}>Marketing</span><span className={styles.systemDescription}>This project</span><strong className="mt-6 block text-xl font-medium">Design Studio</strong><span className={styles.systemDescription}>Plus Jakarta Sans<br />Warm neutrals<br />Untitled UI / React Aria</span><span className={styles.systemAction}>Explore the system ↗</span></a><a href="/systems/product" className={styles.systemCard}><span className={styles.systemName}>Product</span><span className={styles.systemDescription}>Feedback Inbox sample</span><img src={viewPreview} alt="Product system in use in the feedback inbox." className="mt-6 w-full border border-border-secondary" loading="lazy" width={1280} height={720} /><span className={styles.systemDescription}>Space Grotesk<br />Emerald accents<br />shadcn / Base UI</span><span className={styles.systemAction}>Explore the system ↗</span></a></div>
        </div>
      </section>
      <Setup />
      <section className="mx-auto max-w-3xl px-6 pb-16"><h2 className="text-xl font-semibold">A few things to know</h2><div className="mt-5">{questions.map(([question,answer]) => <details key={question} className="group border-b border-border-secondary py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-md font-semibold">{question}<span aria-hidden className="text-text-brand-secondary group-open:rotate-45">+</span></summary><p className="mt-3 text-md leading-relaxed text-text-tertiary">{answer}</p></details>)}</div></section>
    </main>
    <footer className="border-t border-border-secondary"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-text-tertiary"><span className="flex items-center gap-3"><StudioMark />Design Studio</span><div className="flex flex-wrap gap-6"><a href="/documentation/guide">Guide</a><a href="/prototypes/patrick/design-studio-marketing/project-brief">About this marketing demo</a><a href="https://github.com/itspatmorgan/design-studio-starter" target="_blank" rel="noreferrer">GitHub ↗</a></div></div></footer>
  </div>;
}
