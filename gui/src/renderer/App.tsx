/* ───────────────────────── renderer/App.tsx
   Root shell + dedicated #/editor page
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Home        from './Home'
import Library     from './Library'
import Marketplace from './Marketplace'
import TemplateEditor from './TemplateEditor'
import ErrorBoundary from './ErrorBoundary'
import { TemplateJSON } from '../services/templates'

/* ───────────── helpers */
const qc = new QueryClient()

/** shorthands for optional electron-preload API */
const elec = <T>(fn: (e: any) => T, fallback?: T) =>
  typeof window !== 'undefined' && (window as any).electron
    ? fn((window as any).electron)
    : (fallback as T)

/* ------------------------------------------------ editor-only page */
function maybeRenderEditorOnly () {
  const hash = typeof window === 'undefined' ? ''
             : window.location.hash.replace(/^#\/editor\/?/, '')

  if (!window.location.hash.startsWith('#/editor')) return null

  /* parse encoded JSON if present */
  let tpl: TemplateJSON | null = null
  if (hash) {
    try { tpl = JSON.parse(decodeURIComponent(hash)) }
    catch { /* ignore */ }
  }

  const close = () => window.close()

  return (
    <QueryClientProvider client={qc}>
      <TemplateEditor editing={tpl} onClose={close} />
    </QueryClientProvider>
  )
}

/* ------------------------------------------------ normal shell */
export default function App () {
  /* standalone editor tab? */
  const standalone = maybeRenderEditorOnly()
  if (standalone) return standalone

  type View = 'home' | 'library' | 'market'
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

  /* open editor in popup (electron or browser) */
  const openEditor = (tpl: TemplateJSON | null) =>
    elec(e => {
      if (e.openEditor) return e.openEditor(tpl)     // electron path
      const hash = tpl
        ? '#/editor/' + encodeURIComponent(JSON.stringify(tpl))
        : '#/editor'
      window.open(
        `${location.origin}/${hash}`,
        '_blank',
        'popup=yes,width=740,height=760,noopener,noreferrer'
      )
    })

  const runAuto = (tpl: TemplateJSON) =>
    elec(e => e.runCli && e.runCli(['--prompt', tpl.prompt]))

  /* ------------- UI */
  return (
    <QueryClientProvider client={qc}>
      <ErrorBoundary>
        {/* CLI banner */}
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

        <div style={{ padding:16,fontFamily:'sans-serif' }}>
          {/* nav */}
          <nav style={{ marginBottom:24 }}>
            <a style={{ marginRight:16,cursor:'pointer' }}
               onClick={() => setView('home')}>Home</a>
            <a style={{ marginRight:16,cursor:'pointer' }}
               onClick={() => setView('library')}>Library</a>
            <a style={{ cursor:'pointer' }}
               onClick={() => setView('market')}>Marketplace</a>
          </nav>

          {/* routes */}
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
