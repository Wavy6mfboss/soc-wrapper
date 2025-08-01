/* ───────────────────────── renderer/App.tsx
   Router – Home | Library | Marketplace | EditorWindow
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
  /* initial view: if hash is #/editor (child window) show editor */
  const [view, setView] = useState<View>(
    window.location.hash === '#/editor' ? 'editor' : 'home'
  )

  /* child window keeps hash #/editor; main window changes via nav */
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#/editor') setView('editor')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const run = (t: TemplateJSON) =>
    window.electron.runCli(['--prompt', t.prompt])

  return (
    <QueryClientProvider client={qc}>
      <ErrorBoundary>
        {view === 'editor' ? (
          <EditorWindow />                       {/* only the editor UI */}
        ) : (
          <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
            <nav style={{ marginBottom: 24 }}>
              <a onClick={() => setView('home')}
                 style={{ marginRight:16,cursor:'pointer' }}>Home</a>
              <a onClick={() => setView('library')}
                 style={{ marginRight:16,cursor:'pointer' }}>Library</a>
              <a onClick={() => setView('market')}
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
