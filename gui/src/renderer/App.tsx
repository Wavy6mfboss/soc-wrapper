/* ───────────────────────── renderer/App.tsx
   Simple two-page router (Home | Library)
────────────────────────────────────────────────────────── */
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Home     from './Home'
import Library  from './Library'
import ErrorBoundary from './ErrorBoundary'
import { TemplateJSON } from '../services/templates'

const qc = new QueryClient()
type View = 'home' | 'library'

export default function App () {
  const [view, setView] = useState<View>('home')

  const run = async (t: TemplateJSON) =>
    window.electron.runCli(['--prompt', t.prompt])

  return (
    <QueryClientProvider client={qc}>
      <ErrorBoundary>
        <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
          <nav style={{ marginBottom: 24 }}>
            <a
              onClick={() => setView('home')}
              style={{ marginRight: 16, cursor: 'pointer' }}
            >
              Home
            </a>
            <a
              onClick={() => setView('library')}
              style={{ cursor: 'pointer' }}
            >
              Library
            </a>
          </nav>

          {view === 'home'    && <Home />}
          {view === 'library' && <Library onRun={run} />}
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
