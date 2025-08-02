/* ───────────────────────── renderer/Home.tsx
   Safe when window.electron is absent
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'

interface Cfg{ env:string; userData:string }

/* helper: run only if preload exists */
const elec = <T,>(fn:(e:any)=>T, fallback:T)=>(
  typeof window!=='undefined' && (window as any).electron
    ? fn((window as any).electron)
    : fallback
)

export default function Home(){
  const[cfg,setCfg]=useState<Cfg|null>(null)
  const[saved,setSaved]=useState(0)

  useEffect(()=>{
    let off=()=>{}
    ;(async()=>{
      const c = await elec(e=>e.getConfig(), null)
      if(c) setCfg(c)
      off = elec(e=>e.onTemplateSaved(()=>setSaved(x=>x+1)), ()=>{})
    })()
    return ()=>off()
  },[])

  return (
    <div>
      <h1>Welcome to SOC-Wrapper</h1>
      {cfg && (
        <p style={{fontSize:12,color:'#666'}}>
          mode: <b>{cfg.env}</b> • data dir: {cfg.userData}
        </p>
      )}
      {saved>0 && <p style={{color:'#090'}}>✔ Template saved ({saved})</p>}
      <p>Create automations in <em>Library</em> or browse the <em>Marketplace</em>.</p>
    </div>
  )
}
