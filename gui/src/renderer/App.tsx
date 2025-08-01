/* ───────────────────────── renderer/App.tsx
   Views + concise CLI banner
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Home         from './Home'
import Library      from './Library'
import Marketplace  from './Marketplace'
import EditorWindow from './EditorWindow'
import { ErrorBoundary } from './ErrorBoundary'
import { TemplateJSON } from '../services/templates'

const qc = new QueryClient()
type View = 'home' | 'library' | 'market' | 'editor'

export default function App () {
  /* ---------- routing ---------------------------------------------- */
  const [view, setView] = useState<View>(
    window.location.hash === '#/editor' ? 'editor' : 'home'
  )
  useEffect(() => {
    const h = () => { if (window.location.hash === '#/editor') setView('editor') }
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])

  /* ---------- CLI banner ------------------------------------------- */
  const [running, setRunning] = useState(false)
  useEffect(() => {
    const offStart = window.electron.onCliStarted(() => setRunning(true))
    const offEnd   = window.electron.onCliEnded(()  => setRunning(false))
    return () => { offStart(); offEnd() }
  }, [])

  const run = (t: TemplateJSON) =>
    window.electron.runCli(['--prompt', t.prompt])

  /* ---------- UI --------------------------------------------------- */
  return (
    <QueryClientProvider client={qc}>
      <ErrorBoundary>
        {view === 'editor' ? (
          <EditorWindow />
        ) : (
          <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
            {/* CLI running banner */}
            {running && (
              <div style={{
                background:'#ffeeaa', padding:'6px 12px', marginBottom:16,
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>🚀 Automation running…</span>
                <button onClick={()=>window.electron.stopCli()}>Stop</button>
              </div>
            )}

            {/* nav */}
            <nav style={{ marginBottom: 24 }}>
              <a onClick={()=>setView('home')}
                 style={{ marginRight:16,cursor:'pointer' }}>Home</a>
              <a onClick={()=>setView('library')}
                 style={{ marginRight:16,cursor:'pointer' }}>Library</a>
              <a onClick={()=>setView('market')}
                 style={{ cursor:'pointer' }}>Marketplace</a>
            </nav>

            {view === 'home'    && <Home />}
            {view === 'library' && <Library onRun={run} />}
            {view === 'market'  && <Marketplace />}
          </div>
        )}
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
