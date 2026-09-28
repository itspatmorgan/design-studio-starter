import '../styles/index.css';
import { useEffect, useState } from 'react';
import Index from './Index.jsx';
import PrototypeViewer from './PrototypeViewer.jsx';
import SystemsPage from './SystemsPage.jsx';
import { Link } from './navigate.jsx';

const readUrl = () => Object.fromEntries(new URLSearchParams(location.search));

function useManifest() {
  const [manifest, setManifest] = useState(null);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}prototypes/manifest.json`)
      .then((r) => r.json())
      .then(setManifest)
      .catch(() => setManifest({ prototypes: [] }));
  }, []);
  return manifest;
}

export default function App() {
  const [params, setParams] = useState(readUrl);
  const manifest = useManifest();
  useEffect(() => {
    const onPop = () => setParams(readUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  let page;
  if (params.page === 'systems') page = <SystemsPage />;
  else if (params.contributor && params.prototype) page = <PrototypeViewer params={params} manifest={manifest} />;
  else page = <Index manifest={manifest} />;

  const tab = (active) => `rounded-md px-3 py-1.5 hover:bg-muted ${active ? 'bg-muted font-medium' : 'text-muted-foreground'}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center gap-6 border-b px-6 text-sm">
        <span className="font-semibold">Prototype Sandbox</span>
        <nav className="flex gap-1" aria-label="Main">
          <Link to={{}} className={tab(params.page !== 'systems')}>Prototypes</Link>
          <Link to={{ page: 'systems' }} className={tab(params.page === 'systems')}>Systems</Link>
        </nav>
      </header>
      {page}
    </div>
  );
}
