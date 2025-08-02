/* ───────────────────────── renderer/App.tsx
   Navigation + CLI banner + editor popup
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Home        from './Home'
import Library     from './Library'
import Marketplace from './Marketplace'
import ErrorBoundary from './ErrorBoundary'
import { TemplateJSON } from '../services/templates'

const qc = new QueryClient()
type View = 'home' | 'library' | 'market'

/* helper – run only when preload injected */
const elec = <T>(fn: (e: any) => T, fallback?: T) =>
  typeof window !== 'undefined' && (window as any).electron
    ? fn((window as any).electron)
    : (fallback as T)

/* ------------------------------------------------ open editor */
function openEditor (tpl: TemplateJSON | null) {
  elec(e => {
    if (e.openEditor) {
      /* electron path */
      e.openEditor(tpl)
    } else {
      /* vite-preview (plain browser) fallback */
      const hash = tpl
        ? '#/editor/' + encodeURIComponent(JSON.stringify(tpl))
        : '#/editor'
      window.open(
        `${location.origin}/${hash}`,
        '_blank',
        'popup=yes,width=740,height=760,noopener,noreferrer'
      )
    }
  })
}

/* ------------------------------------------------ main component */
export default function App () {
  const [view, setView]   = useState<View>('home')
  const [running, setRun] = useState(false)

  /* CLI start / stop banner */
  useEffect(() => {
    let off1 = () => {}, off2 = () => {}
    elec(e => {
      off1 = e.onCliStarted ? e.onCliStarted(() => setRun(true))  : off1
      off2 = e.onCliEnded   ? e.onCliEnded  (() => setRun(false)) : off2
    })
    return () => { off1(); off2() }
  }, [])

  const runAuto = (tpl: TemplateJSON) =>
    elec(e => e.runCli && e.runCli(['--prompt', tpl.prompt]))

  return (
    <QueryClientProvider client={qc}>
      <ErrorBoundary>
        {/* banner */}
        {running && (
          <div style={{
            background:'#ffeeaa',padding:'6px 12px',marginBottom:16,
            display:'flex',justifyContent:'space-between',alignItems:'center'}}
          >
            <span>🚀 Automation running…</span>
            <button onClick={() => elec(e => e.stopCli && e.stopCli())}>
              Stop
            </button>
          </div>
        )}

        {/* nav + routes */}
        <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
          <nav style={{ marginBottom: 24 }}>
            <a style={{ marginRight: 16, cursor: 'pointer' }}
               onClick={() => setView('home')}>Home</a>
            <a style={{ marginRight: 16, cursor: 'pointer' }}
               onClick={() => setView('library')}>Library</a>
            <a style={{ cursor: 'pointer' }}
               onClick={() => setView('market')}>Marketplace</a>
          </nav>

          {view === 'home'    && <Home />}
          {view === 'library' && (
            <Library onRun={runAuto} onEdit={openEditor} />
          )}
          {view === 'market'  && <Marketplace />}
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
