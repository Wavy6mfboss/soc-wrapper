/* ───────────────────────── renderer/App.tsx
   Routing + CLI banner + editor-popup launcher
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Home         from './Home'
import Library      from './Library'
import Marketplace  from './Marketplace'
import ErrorBoundary from './ErrorBoundary'
import { TemplateJSON } from '../services/templates'

const qc = new QueryClient()
type View = 'home'|'library'|'market'

/* ---------- helper: open editor in popup ------------------- */
function launchEditor (tpl: TemplateJSON | null) {
  /* EditorWindow reads its data from location.hash */
  const hash = tpl ? '#' + encodeURIComponent(JSON.stringify(tpl)) : ''
  const url  = `${location.origin}/#/editor${hash}`

  /* This plain window.open keeps the preload context in the parent;
     EditorWindow already calls window.opener.electron.templateSaved() */
  window.open(
    url,
    '_blank',
    'popup=yes,width=740,height=760,noopener,noreferrer',
  )
}

export default function App () {
  const [view,setView]   = useState<View>('home')
  const [running,setRun] = useState(false)

  /* CLI banner wiring */
  useEffect(()=>{
    const off1=window.electron.onCliStarted(()=>setRun(true))
    const off2=window.electron.onCliEnded (()=>setRun(false))
    return()=>{off1();off2()}
  },[])

  const runAutomation = (tpl:TemplateJSON)=>
    window.electron.runCli(['--prompt',tpl.prompt])

  return (
    <QueryClientProvider client={qc}>
      <ErrorBoundary>
        <div style={{padding:16,fontFamily:'sans-serif'}}>
          {running && (
            <div style={{
              background:'#ffeeaa',padding:'6px 12px',marginBottom:16,
              display:'flex',justifyContent:'space-between',alignItems:'center',
            }}>
              <span>🚀 Automation running…</span>
              <button onClick={()=>window.electron.stopCli()}>Stop</button>
            </div>
          )}

          {/* nav */}
          <nav style={{marginBottom:24}}>
            <a style={{marginRight:16,cursor:'pointer'}} onClick={()=>setView('home')}>Home</a>
            <a style={{marginRight:16,cursor:'pointer'}} onClick={()=>setView('library')}>Library</a>
            <a style={{cursor:'pointer'}} onClick={()=>setView('market')}>Marketplace</a>
          </nav>

          {view==='home'    && <Home />}
          {view==='library' && (
            <Library
              onRun ={runAutomation}
              onEdit={launchEditor}   /* ← popup launcher */
            />
          )}
          {view==='market'  && <Marketplace />}
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
