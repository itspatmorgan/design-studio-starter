// Investigation only. Copied into src temporarily by the runner; not a production entry.
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from '@tanstack/react-router';
import { loadPrototypeByIdentity, findArtifactByIdentity } from '@/platform/app/data/manifest';
import { loadView } from '@/modules/view/load';
import ViewFrame from '@/modules/view/ViewFrame';
import '@/platform/app/styles.css';

const feedback='/prototypes/ccncfpcyaa1hvjts/artifacts/0qd3s4spbfcpbb2j';
const marketing='/prototypes/2h7mkxzppqfjv1xv/artifacts/aa1q57swhwgk759f';
const child=new URLSearchParams(location.search).has('child');
const initial=new URLSearchParams(location.search).get('artifact') || feedback;
function Probe(){
 const ref=useRef<HTMLDivElement>(null);const [data,setData]=useState('');
 const update=()=>{const doc=ref.current?.ownerDocument;setData(`JS viewport ${window.innerWidth}px · JS mobile ${window.matchMedia('(max-width:600px)').matches} · same document ${doc===document} · global focus ${document.activeElement?.tagName} · local focus ${doc?.activeElement?.tagName}`)};
 useEffect(()=>{update();window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update)},[]);
 return <div ref={ref} className="experiment-probe"><p>{data}</p><label>Focus probe <input aria-label="Focus probe" onFocus={()=>setTimeout(update)} /></label><button onClick={()=>{const s=document.createElement("style");s.textContent="h1{text-decoration:underline!important}";document.head.appendChild(s)}}>Inject global CSS</button><span className="css-mobile">CSS mobile</span><span className="css-desktop">CSS desktop</span></div>;
}
// This experiment reuses public route paths in an independent memory router.
// The globally registered Studio router gives that path a different loader type;
// the local loader contract below is explicit. Production needs its own typed runtime router.
function makeRouter(path:string){
 const root=createRootRoute({component:Outlet});
 const route=createRoute({getParentRoute:()=>root,path:'/prototypes/$prototype/artifacts/$artifact',validateSearch:(s:Record<string,unknown>)=>s,loader:async({params})=>{
  const proto=await loadPrototypeByIdentity(params.prototype);const item=proto && findArtifactByIdentity(proto,params.artifact);if(!proto||!item)throw Error('Missing real artifact');const loaded=await loadView({proto,item});if(!loaded)throw Error('Could not load real view');return loaded;
 },component:()=>{const data=route.useLoaderData() as unknown as NonNullable<Awaited<ReturnType<typeof loadView>>>;return <><Probe/><div style={{display:'flex',height:'calc(100% - 92px)',minHeight:0}}><ViewFrame {...data}/></div></>},errorComponent:({error})=><pre role="alert">{String(error)}</pre>});
 return createRouter({routeTree:root.addChildren([route]),history:createMemoryHistory({initialEntries:[path]})});
}
function PortalCandidate({path,dark}:{path:string;dark:boolean}){
 const ref=useRef<HTMLIFrameElement>(null);const [mount,setMount]=useState<HTMLElement|null>(null);const [router]=useState(()=>makeRouter(path));
 useEffect(()=>{const doc=ref.current!.contentDocument!;doc.open();doc.write('<!doctype html><html><head></head><body><div id="preview-root" style="height:100vh"></div></body></html>');doc.close();
  const sync=()=>{doc.head.querySelectorAll('[data-experiment-style]').forEach(e=>e.remove());document.head.querySelectorAll('style[data-vite-dev-id],link[rel="stylesheet"]').forEach(e=>{const clone=e.cloneNode(true) as HTMLElement;clone.setAttribute('data-experiment-style','');doc.head.appendChild(clone)});const style=doc.createElement('style');style.setAttribute('data-experiment-style','');style.textContent=probeCss;doc.head.appendChild(style)};sync();const observer=new MutationObserver(sync);observer.observe(document.head,{childList:true,subtree:true,characterData:true});setMount(doc.getElementById('preview-root'));return()=>observer.disconnect();
 },[]);
 useEffect(()=>{ref.current?.contentDocument?.documentElement.classList.toggle('dark',dark);document.documentElement.classList.toggle('dark',dark)},[dark]);
 return <><iframe ref={ref} title="Parent portal" style={frameStyle}/>{mount&&createPortal(<RouterProvider router={router}/>,mount)}</>;
}
const probeCss='.experiment-probe{height:92px;padding:8px;font:12px system-ui;background:Canvas;color:CanvasText;border-bottom:1px solid GrayText}.experiment-probe input{border:1px solid GrayText;width:110px}.experiment-probe p{margin:0 0 6px}.css-mobile{display:none;margin-left:12px}.css-desktop{margin-left:12px}@media(max-width:600px){.css-mobile{display:inline}.css-desktop{display:none}}';
const style=document.createElement('style');style.textContent=probeCss+' html,body{margin:0} #experiment-root{height:100vh} #experiment-host{padding:20px;overflow:auto;height:100vh;background:Canvas;color:CanvasText} #experiment-host button,#experiment-host select{border:1px solid GrayText;padding:8px;margin:4px}';document.head.appendChild(style);
const frameStyle={width:'100%',height:740,border:'1px solid GrayText'};
function Host(){const [path,setPath]=useState(initial);const [width,setWidth]=useState(420);const [dark,setDark]=useState(false);return <div id="experiment-host"><h1>Artifact-only boundary comparison</h1><p>Unchanged real React views · independent memory routers · no Studio shell</p><select aria-label="Prototype" value={path} onChange={e=>setPath(e.target.value)}><option value={feedback}>Feedback Inbox · Product system</option><option value={marketing}>Landing page · Marketing system</option></select><button onClick={()=>setWidth(width===420?900:420)}>{width===420?'Use desktop width':'Use mobile width'}</button><button onClick={()=>setDark(!dark)}>Toggle color mode</button><p>Frame width: {width}px. Host remains wider. Compare CSS and JavaScript viewport readings.</p><div style={{display:'flex',gap:20,flexWrap:'wrap'}}><section style={{width,maxWidth:'100%'}}><h2>Parent React portal</h2><PortalCandidate key={path} path={path} dark={dark}/></section><section style={{width,maxWidth:'100%'}}><h2>Child React runtime</h2><iframe key={path+dark} title="Child runtime" src={`/preview-boundary-compare.html?child=1&artifact=${encodeURIComponent(path)}&dark=${dark}`} style={frameStyle}/><a href={`/preview-boundary-compare.html?child=1&artifact=${encodeURIComponent(path)}&dark=${dark}`} target="_blank">Open direct artifact runtime</a></section></div></div>}
const root=createRoot(document.getElementById('experiment-root')!);
if(child){
 document.documentElement.classList.toggle('dark',new URLSearchParams(location.search).get('dark')==='true');
 root.render(<RouterProvider router={makeRouter(initial)}/>);
}else root.render(<Host/>);
// Editing this fixture itself must dispose its root, not create a second one.
if(import.meta.hot) import.meta.hot.dispose(()=>{root.unmount();style.remove()});

