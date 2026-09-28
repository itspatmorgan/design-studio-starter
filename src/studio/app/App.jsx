import '../styles/index.css';
import { useEffect, useState } from 'react';
import Index from './Index.jsx';
import PrototypeViewer from './PrototypeViewer.jsx';
import SystemsPage from './SystemsPage.jsx';
import { Link } from './navigate.jsx';

function readUrl() {
  return Object.fromEntries(new URLSearchParams(location.search));
}

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

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-6 border-b px-6 py-3 text-sm">
        <span className="font-semibold">Prototype Sandbox</span>
        <nav className="flex gap-4" aria-label="Main">
          <Link to={{}} className="hover:underline">Prototypes</Link>
          <Link to={{ page: 'systems' }} className="hover:underline">Systems</Link>
        </nav>
      </header>
      {page}
    </div>
  );
}
