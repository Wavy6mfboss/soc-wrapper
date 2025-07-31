/* ───────────────────────── renderer/App.tsx
   Root component – routing, CLI banner, remountable editor
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Home            from './Home'
import Library         from './Library'
import TemplateEditor  from './TemplateEditor'
import { ErrorBoundary } from './ErrorBoundary'
import { TemplateJSON }  from '../services/templates'   // ← relative path

const queryClient = new QueryClient()

type Page =
  | { view: 'home' }
  | { view: 'library' }
  | { view: 'editor'; editing: TemplateJSON | null }

export default function App () {
  const [page, setPage]       = useState<Page>({ view: 'home' })
  const [running, setRunning] = useState(false)
  const [lastCmd, setLastCmd] = useState<string>('')

  /* CLI lifecycle events from preload */
  useEffect(() => {
    const offStart = window.electron.onCliStarted((cmd?: string[]) => {
      setRunning(true)
      setLastCmd(Array.isArray(cmd) ? cmd.join(' ') : '')
    })
    const offEnd = window.electron.onCliEnded(() => setRunning(false))
    return () => { offStart(); offEnd() }
  }, [])

  const handleRun = (tpl: TemplateJSON) =>
    window.electron.runCli(['--prompt', tpl.prompt])

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {running && (
          <div style={{
            background:'#ffeeaa',padding:'6px 12px',
            display:'flex',justifyContent:'space-between',
          }}>
            <span>
              🚀 Running&nbsp;
              {lastCmd ? <code>{lastCmd}</code> : <em>automation…</em>}
            </span>
            <button onClick={() => window.electron.stopCli()}>Stop</button>
          </div>
        )}

        <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
          <nav style={{ marginBottom: 24 }}>
            <a onClick={() => setPage({ view:'home' })}
               style={{ marginRight:16,cursor:'pointer' }}>Home</a>
            <a onClick={() => setPage({ view:'library' })}
               style={{ cursor:'pointer' }}>Library</a>
          </nav>

          {page.view === 'home' && <Home />}

          {page.view === 'library' && (
            <Library
              onRun ={handleRun}
              onEdit={tpl => setPage({ view:'editor', editing: tpl })}
            />
          )}

          {page.view === 'editor' && (
            <TemplateEditor
              key={page.editing?.id ?? 'new'}   /* remount every open */
              editing={page.editing}
              onClose={() => setPage({ view:'library' })}
            />
          )}
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
