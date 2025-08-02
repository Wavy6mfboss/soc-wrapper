/* ───────────────────────── renderer/App.tsx
   Routing + CLI banner + fixed Edit handler
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Home          from './Home'
import Library       from './Library'
import Marketplace   from './Marketplace'
import EditorWindow  from './EditorWindow'
import { ErrorBoundary } from './ErrorBoundary'
import { TemplateJSON }  from '../services/templates'

const qc   = new QueryClient()
type View  = 'home' | 'library' | 'market' | 'editor'

export default function App () {
  /* -------------- routing ------------------------------------------ */
  const [view, setView] = useState<View>(
    window.location.hash === '#/editor' ? 'editor' : 'home'
  )
  useEffect(() => {
    const onHash = () => {
      setView(window.location.hash === '#/editor' ? 'editor' : 'home')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  /* -------------- CLI banner --------------------------------------- */
  const [running, setRunning] = useState(false)
  useEffect(() => {
    const offStart = window.electron.onCliStarted(() => setRunning(true))
    const offEnd   = window.electron.onCliEnded  (() => setRunning(false))
    return () => { offStart(); offEnd() }
  }, [])

  const runAutomation = (tpl: TemplateJSON) =>
    window.electron.runCli(['--prompt', tpl.prompt])

  /* ← new: opens the editor window (existing preload helper) */
  const editTemplate = (tpl: TemplateJSON | null) =>
    window.electron.openEditor(tpl)

  /* -------------- UI ------------------------------------------------ */
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
                display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <span>🚀 Automation running…</span>
                <button onClick={()=>window.electron.stopCli()}>Stop</button>
              </div>
            )}

            {/* nav */}
            <nav style={{ marginBottom: 24 }}>
              <a
                style={{ marginRight:16, cursor:'pointer' }}
                onClick={()=>setView('home')}
              >Home</a>
              <a
                style={{ marginRight:16, cursor:'pointer' }}
                onClick={()=>setView('library')}
              >Library</a>
              <a
                style={{ cursor:'pointer' }}
                onClick={()=>setView('market')}
              >Marketplace</a>
            </nav>

            {view === 'home'    && <Home />}
            {view === 'library' && (
              <Library
                onRun ={runAutomation}
                onEdit={editTemplate}        /* ← fixed */
              />
            )}
            {view === 'market'  && <Marketplace />}
          </div>
        )}
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
