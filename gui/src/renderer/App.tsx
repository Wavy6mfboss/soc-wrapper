/* ───────────────────────── renderer/App.tsx
   Routing + CLI banner + editor-window launcher (hash payload)
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Home         from './Home'
import Library      from './Library'
import Marketplace  from './Marketplace'
import ErrorBoundary from './ErrorBoundary'
import { TemplateJSON } from '../services/templates'

const qc   = new QueryClient()
type View  = 'home' | 'library' | 'market'

/* ---------- helper: open editor window ------------------- */
function openEditor (tpl: TemplateJSON | null) {
  /* EditorWindow expects templ JSON in location.hash (or blank) */
  const hash = tpl ? `#${encodeURIComponent(JSON.stringify(tpl))}` : ''
  const url  = `${window.location.origin}/#/editor${hash}`
  window.open(
    url,
    '_blank',
    'popup=yes,width=740,height=760,noopener,noreferrer',
  )
}

/* ---------- main component ------------------------------- */
export default function App () {
  const [view, setView] = useState<View>('home')

  /* CLI banner state */
  const [running, setRunning] = useState(false)
  useEffect(() => {
    const offStart = window.electron.onCliStarted(() => setRunning(true))
    const offEnd   = window.electron.onCliEnded  (() => setRunning(false))
    return () => { offStart(); offEnd() }
  }, [])

  const runAutomation = (tpl: TemplateJSON) =>
    window.electron.runCli(['--prompt', tpl.prompt])

  return (
    <QueryClientProvider client={qc}>
      <ErrorBoundary>
        <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
          {/* CLI running banner */}
          {running && (
            <div style={{
              background:'#ffeeaa', padding:'6px 12px', marginBottom:16,
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <span>🚀 Automation running…</span>
              <button onClick={()=>window.electron.stopCli()}>Stop</button>
            </div>
          )}

          {/* nav */}
          <nav style={{ marginBottom: 24 }}>
            <a style={{marginRight:16,cursor:'pointer'}} onClick={()=>setView('home')}>Home</a>
            <a style={{marginRight:16,cursor:'pointer'}} onClick={()=>setView('library')}>Library</a>
            <a style={{cursor:'pointer'}} onClick={()=>setView('market')}>Marketplace</a>
          </nav>

          {view === 'home'    && <Home />}
          {view === 'library' && (
            <Library
              onRun ={runAutomation}
              onEdit={openEditor}      {/* ← fixed launcher */}
            />
          )}
          {view === 'market'  && <Marketplace />}
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
