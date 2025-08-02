/* ───────────────────────── renderer/App.tsx
   Navigation + CLI banner + editor popup
────────────────────────────────────────────────────────── */
import React,{useEffect,useState} from 'react'
import { QueryClient,QueryClientProvider } from '@tanstack/react-query'

import Home        from './Home'
import Library     from './Library'
import Marketplace from './Marketplace'
import ErrorBoundary from './ErrorBoundary'
import { TemplateJSON } from '../services/templates'

const qc = new QueryClient()
type View='home'|'library'|'market'
const elec = (fn:(e:any)=>void)=>{ const w=(window as any).electron; if(w) fn(w) }

const openEditor=(tpl:TemplateJSON|null)=>{
  elec(e=>e.openEditor?t e.openEditor(tpl): window.open(
    `${location.origin}/#/editor/${tpl?encodeURIComponent(JSON.stringify(tpl)):''}`,
    '_blank','popup=yes,width=740,height=760,noopener,noreferrer'))
}

export default function App(){
  const[view,setView]=useState<View>('home')
  const[running,setRun]=useState(false)

  useEffect(()=>{
    let off1=()=>{},off2=()=>{}
    elec(e=>{
      if(e.onCliStarted) off1=e.onCliStarted(()=>setRun(true))
      if(e.onCliEnded)   off2=e.onCliEnded (()=>setRun(false))
    })
    return ()=>{off1();off2()}
  },[])

  const runAuto=(tpl:TemplateJSON)=>
    elec(e=>e.runCli&&e.runCli(['--prompt',tpl.prompt]))

  return(
    <QueryClientProvider client={qc}>
      <ErrorBoundary>
        {running&&(
          <div style={{
            background:'#ffeeaa',padding:'6px 12px',marginBottom:16,
            display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>🚀 Automation running…</span>
            <button onClick={()=>elec(e=>e.stopCli&&e.stopCli())}>Stop</button>
          </div>
        )}

        <div style={{padding:16,fontFamily:'sans-serif'}}>
          <nav style={{marginBottom:24}}>
            <a style={{marginRight:16,cursor:'pointer'}} onClick={()=>setView('home')}>Home</a>
            <a style={{marginRight:16,cursor:'pointer'}} onClick={()=>setView('library')}>Library</a>
            <a style={{cursor:'pointer'}} onClick={()=>setView('market')}>Marketplace</a>
          </nav>

          {view==='home'   && <Home />}
          {view==='library'&&<Library onRun={runAuto} onEdit={openEditor}/> }
          {view==='market' && <Marketplace /> }
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
