import { ArrowUpRight } from '@untitledui/icons';
import { Button } from '@/systems/marketing/components/button';
import { Tabs } from '@/systems/marketing/components/tabs';
import viewPreview from './assets/demo-view.jpg';
import diagramPreview from './assets/demo-diagram.jpg';
import canvasPreview from './assets/demo-canvas.jpg';
import documentPreview from './assets/demo-document.jpg';
import agentMarkdown from './_components/agent.txt?raw';
import styles from './_components/landing.module.css';

const repository = 'https://github.com/itspatmorgan/design-studio-starter';
const commands = `git clone ${repository}.git
cd design-studio-starter
mise install
mise exec -- pnpm install
mise exec -- pnpm dev`;
const examples = [
  { id: 'view', label: 'View', image: viewPreview, alt: 'Feedback Inbox interface built with the Product system.', text: 'Build a working interface with your own components.' },
  { id: 'diagram', label: 'Diagram', image: diagramPreview, alt: 'Mermaid diagram of the feedback review flow.', text: 'Make the system and its flows easier to understand.' },
  { id: 'canvas', label: 'Canvas', image: canvasPreview, alt: 'Breadboard canvas with an embedded diagram and editable drawing.', text: 'Explore ideas and arrange references on an open canvas.' },
  { id: 'document', label: 'Document', image: documentPreview, alt: 'Project context document with connected exploration artifacts.', text: 'Keep the reasoning and references alongside the work.' },
];
function StudioMark() {
  return <svg viewBox="0 0 40 32" className="h-8 w-10" aria-hidden="true" fill="currentColor"><path d="M0 0h11v32H0zM15 0h3a16 16 0 0 1 0 32h-3z" /></svg>;
}
export default function MarketingLanding() {
  return <div className="min-h-full bg-bg-primary font-sans text-text-primary">
    <Tabs defaultSelectedKey="human" className="mx-auto max-w-4xl px-6">
      <header className="flex flex-wrap items-center justify-between gap-6 py-8">
        <a href="#" className="flex items-center gap-3 text-lg font-semibold"><StudioMark />Design Studio</a>
        <Tabs.List aria-label="Reading mode"><Tabs.Item id="human">Human</Tabs.Item><Tabs.Item id="agent">Agent</Tabs.Item></Tabs.List>
      </header>
      <Tabs.Panel id="human">
        <main>
          <section className="pt-12 pb-16 md:pt-16 md:pb-20">
            <h1 className="max-w-3xl text-display-md font-medium tracking-tight md:text-display-lg">A space to make<br />ideas real.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-tertiary">An open-source prototype sandbox for designers and builders. Work with your coding agent, your components, and your context.</p>
            <div className="mt-6"><Button href="#install" size="lg">Get started</Button></div>
          </section>
          <section className="py-8 md:py-12" aria-labelledby="demo-title">
            <h2 id="demo-title" className="text-display-sm font-medium tracking-tight">One idea. Different ways to explore.</h2>
            <Tabs defaultSelectedKey="view" className="mt-6">
              <Tabs.List aria-label="Artifact examples">{examples.map(item => <Tabs.Item key={item.id} id={item.id}>{item.label}</Tabs.Item>)}</Tabs.List>
              {examples.map(item => <Tabs.Panel key={item.id} id={item.id} className="pt-5">
                <figure><img src={item.image} alt={item.alt} className={styles.preview} width={item.id === 'document' ? 1456 : 1280} height={item.id === 'document' ? 799 : 720} /><figcaption className="mt-4 text-md text-text-secondary">{item.text}</figcaption></figure>
              </Tabs.Panel>)}
            </Tabs>
            <p className="mt-3 text-sm text-text-tertiary">Captured previews from the included Product example.</p>
          </section>
          <section id="install" className="py-16 md:py-20">
            <h2 className="text-display-sm font-medium tracking-tight">Run your own studio.</h2>
            <div className="mt-5"><Button href={repository} color="link-gray" target="_blank" rel="noreferrer" iconTrailing={ArrowUpRight}>Get the repository</Button></div>
            <p className="mt-5 text-md leading-relaxed text-text-tertiary">Install <a href="https://mise.jdx.dev/installing-mise.html" target="_blank" rel="noreferrer" className="underline">mise</a>, then run:</p>
            <pre className={styles.code}><code>{commands}</code></pre>
            <p className="mt-4 text-sm leading-relaxed text-text-tertiary">Open the local URL printed by Vite. For your own repository, choose “Use this template” on GitHub and clone that copy instead.</p>
          </section>
          <section className="pb-16 md:pb-20">
            <h2 className="text-display-sm font-medium tracking-tight">Make it yours.</h2>
            <p className="mt-5 max-w-2xl text-md leading-relaxed text-text-tertiary">Open the folder in your coding environment. Configure your studio, bring your system, and start a prototype.</p>
            <p className="mt-4"><a href="/documentation/guide/getting-started" className="text-md underline">Follow the setup guide ↗</a></p>
          </section>
        </main>
        <footer className="pb-12"><p className="text-sm leading-relaxed text-text-tertiary">This marketing demo uses its own Marketing system: Plus Jakarta Sans, warm neutrals, and Untitled UI.</p><div className="mt-4 flex flex-wrap gap-6 text-sm"><a href="/prototypes/patrick/design-studio-marketing/project-brief">Project brief ↗</a><a href="/systems/marketing">Marketing system ↗</a><a href={repository} target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>
      </Tabs.Panel>
      <Tabs.Panel id="agent"><main className="pt-8 pb-16"><pre className={styles.markdown}>{agentMarkdown}</pre></main></Tabs.Panel>
    </Tabs>
  </div>;
}
