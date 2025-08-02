/* ───────────────────────── renderer/App.tsx
   Routing + CLI banner + editor-popup launcher
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Home        from './Home'
import Library     from './Library'
import Marketplace from './Marketplace'
import ErrorBoundary from './ErrorBoundary'
import { TemplateJSON } from '../services/templates'

const qc = new QueryClient()
type View = 'home'|'library'|'market'

export default function App () {
  const [view,setView] = useState<View>('home')

  /* CLI banner */
  const [running,setRunning]=useState(false)
  useEffect(()=>{
    const off1=window.electron.onCliStarted(()=>setRunning(true))
    const off2=window.electron.onCliEnded (()=>setRunning(false))
    return()=>{off1();off2()}
  },[])

  const runAutomation = (tpl:TemplateJSON)=>
    window.electron.runCli(['--prompt',tpl.prompt])

  const openEditor = (tpl:TemplateJSON|null)=>
    window.electron.openEditor(tpl)          // ← now defined via preload

  return (
    <QueryClientProvider client={qc}>
      <ErrorBoundary>
        <div style={{padding:16,fontFamily:'sans-serif'}}>
          {running&&(
            <div style={{
              background:'#ffeeaa',padding:'6px 12px',marginBottom:16,
              display:'flex',justifyContent:'space-between',alignItems:'center',
            }}>
              <span>🚀 Automation running…</span>
              <button onClick={()=>window.electron.stopCli()}>Stop</button>
            </div>
          )}

          <nav style={{marginBottom:24}}>
            <a style={{marginRight:16,cursor:'pointer'}} onClick={()=>setView('home')}>Home</a>
            <a style={{marginRight:16,cursor:'pointer'}} onClick={()=>setView('library')}>Library</a>
            <a style={{cursor:'pointer'}} onClick={()=>setView('market')}>Marketplace</a>
          </nav>

          {view==='home'   && <Home />}
          {view==='library'&& <Library onRun={runAutomation} onEdit={openEditor} />}
          {view==='market' && <Marketplace />}
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
