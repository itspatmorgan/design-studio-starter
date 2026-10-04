import type { ReactNode } from 'react';
import { ArrowUpRight } from '@untitledui/icons';
import { Button } from '@/systems/marketing/components/button';
import { Tabs } from '@/systems/marketing/components/tabs';
import viewPreview from '../assets/demo-view.jpg';
import diagramPreview from '../assets/demo-diagram.jpg';
import canvasPreview from '../assets/demo-canvas.jpg';
import documentPreview from '../assets/demo-document.jpg';
import agentMarkdown from './agent.txt?raw';
import styles from './landing.module.css';

const repository = 'https://github.com/itspatmorgan/design-studio-starter';
const commands = `git clone https://github.com/YOUR-ACCOUNT/YOUR-STUDIO.git
cd YOUR-STUDIO
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
function ResourceLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('https://');
  return <Button href={href} color="link-gray" size="sm" iconTrailing={ArrowUpRight} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}</Button>;
}
function BrandGeometry({ version }: { version: 2 | 3 }) {
  return <svg viewBox="0 0 480 320" className={styles.geometry} aria-hidden="true">
    <rect width="480" height="320" fill="var(--color-bg-secondary)" />
    {version === 2 ? <>
      <circle cx="240" cy="160" r="150" fill="currentColor" opacity="0.12" />
      <rect x="240" width="120" height="160" fill="currentColor" opacity="0.18" />
      <rect x="360" y="160" width="120" height="160" fill="currentColor" />
      <path d="M0 160H480M240 0V320" stroke="currentColor" opacity="0.3" strokeDasharray="2 6" />
    </> : <>
      <rect x="320" width="160" height="160" fill="currentColor" opacity="0.1" />
      <rect x="160" y="160" width="160" height="160" fill="currentColor" opacity="0.2" />
      <rect x="320" y="160" width="160" height="160" fill="currentColor" />
      <path d="M0 0A320 320 0 0 1 320 320M0 0A160 160 0 0 1 160 160" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M160 0V320M320 0V320M0 160H480" stroke="currentColor" opacity="0.3" strokeDasharray="2 6" />
    </>}
  </svg>;
}
export function LandingPage({ version }: { version: 1 | 2 | 3 }) {
  const headlines = { 1: <>Your next idea.<br />Make it real.</>, 2: <>A studio for<br />what comes next.</>, 3: <>Design. Build.<br />Keep it together.</> };
  const content = <>
        <main>
          <section className={`${styles.hero} ${styles['hero' + version]}`}>
            <div className={styles.heroCopy}>
            <h1 className="text-display-md font-medium tracking-tight md:text-display-lg">{headlines[version]}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-tertiary">An open-source prototype sandbox for designers and builders. Work with your coding agent, your components, and your context.</p>
            <div className="mt-6"><Button href="#install" size="lg">Get started</Button></div>
            </div>
            {version > 1 && <BrandGeometry version={version as 2 | 3} />}
          </section>
          <section className="py-8 md:py-12" aria-labelledby="demo-title">
            <h2 id="demo-title" className="text-display-sm font-medium tracking-tight">{version === 1 ? 'From an idea to a working prototype.' : version === 2 ? 'Give the idea room to move.' : 'One idea. Every part of the story.'}</h2>
            <Tabs defaultSelectedKey={version === 2 ? 'canvas' : 'view'} className="mt-6">
              <Tabs.List aria-label="Artifact examples">{examples.map(item => <Tabs.Item key={item.id} id={item.id}>{item.label}</Tabs.Item>)}</Tabs.List>
              {examples.map(item => <Tabs.Panel key={item.id} id={item.id} className="pt-5">
                <figure><img src={item.image} alt={item.alt} className={styles.preview} width={item.id === 'document' ? 1456 : 1280} height={item.id === 'document' ? 799 : 720} /><figcaption className="mt-4 text-md text-text-secondary">{item.text}</figcaption></figure>
              </Tabs.Panel>)}
            </Tabs>
            <p className="mt-3 text-sm text-text-tertiary">Captured previews from the included Product example.</p>
          </section>
          <section id="install" className="py-16 md:py-20">
            <h2 className="text-display-sm font-medium tracking-tight">Run your own studio.</h2>
            <p className="mt-5 text-md leading-relaxed text-text-tertiary">Choose “Use this template” on GitHub to create your own repository.</p>
            <div className="mt-4 flex flex-wrap gap-6"><ResourceLink href={repository}>Use the template</ResourceLink><ResourceLink href="https://mise.jdx.dev/installing-mise.html">Install mise</ResourceLink></div>
            <p className="mt-5 text-md leading-relaxed text-text-tertiary">Clone your new repository, then run these commands. Replace YOUR-ACCOUNT and YOUR-STUDIO with your GitHub account and repository name.</p>
            <pre className={styles.code}><code>{commands}</code></pre>
            <p className="mt-4 text-sm leading-relaxed text-text-tertiary">Open the local URL printed by Vite.</p>
          </section>
          <section className="pb-16 md:pb-20">
            <h2 className="text-display-sm font-medium tracking-tight">Make it yours.</h2>
            <p className="mt-5 max-w-2xl text-md leading-relaxed text-text-tertiary">Open the folder in your coding environment. Configure your studio, bring your system, and start a prototype.</p>
            <div className="mt-4"><ResourceLink href="/documentation/guide/getting-started">Follow the setup guide</ResourceLink></div>
          </section>
        </main>
        <footer className="pb-12"><p className="text-sm leading-relaxed text-text-tertiary">This marketing demo uses its own Marketing system: Plus Jakarta Sans, warm neutrals, and Untitled UI.</p><div className="mt-4 flex flex-wrap gap-6"><ResourceLink href="/prototypes/patrick/design-studio-marketing/project-brief">Project brief</ResourceLink><ResourceLink href="/systems/marketing">Marketing system</ResourceLink><ResourceLink href={repository}>GitHub</ResourceLink></div></footer>
  </>;
  const brand = <a href="#" className="flex items-center gap-3 text-lg font-semibold"><StudioMark />Design Studio</a>;
  return <div className="min-h-full bg-bg-primary font-sans text-text-primary">
    {version === 3 ? <Tabs defaultSelectedKey="human" className="mx-auto max-w-4xl px-6">
      <header className="flex flex-wrap items-center justify-between gap-6 py-8">{brand}<Tabs.List aria-label="Reading mode"><Tabs.Item id="human">Human</Tabs.Item><Tabs.Item id="agent">Agent</Tabs.Item></Tabs.List></header>
      <Tabs.Panel id="human">{content}</Tabs.Panel>
      <Tabs.Panel id="agent"><main className="pt-8 pb-16"><pre className={styles.markdown}>{agentMarkdown}</pre></main></Tabs.Panel>
    </Tabs> : <div className="mx-auto max-w-4xl px-6"><header className="py-8">{brand}</header>{content}</div>}
  </div>;
}
