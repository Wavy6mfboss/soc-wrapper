/* ───────────────────────── renderer/Home.tsx
   Landing page with quick-run prompt
────────────────────────────────────────────────────────── */
import React,{useEffect,useState} from 'react'

type Cfg = { env:string,userData:string }

/* util – run only if preload present */
const elec = <T,>(fn:(e:any)=>T,fallback:T)=>(
  typeof window!=='undefined' && (window as any).electron
    ? fn((window as any).electron)
    : fallback
)

export default function Home (){
  const[cfg,setCfg]=useState<Cfg|null>(null)
  const[prompt,setPrompt]=useState('')
  const[saved,setSaved]=useState(0)

  /* preload-only helpers */
  useEffect(()=>{
    let off=()=>{}
    ;(async()=>{
      setCfg(await elec(e=>e.getConfig(),null))
      off = elec(e=>e.onTemplateSaved(()=>setSaved(x=>x+1)),()=>{})
    })()
    return()=>off()
  },[])

  const run=()=>prompt&&elec(e=>e.runCli(['--prompt',prompt]),null)

  return(
    <div style={{maxWidth:640}}>
      <h1>Welcome to SOC-Wrapper</h1>

      {cfg&&(
        <p style={{fontSize:12,color:'#666'}}>
          mode: <b>{cfg.env}</b> • data: {cfg.userData}
        </p>
      )}

      {saved>0&&<p style={{color:'#090'}}>✔ Template saved ({saved})</p>}

      <h3>Quick prompt</h3>
      <input style={{width:'100%'}} value={prompt}
        onChange={e=>setPrompt(e.target.value)} placeholder="Type a one-off prompt…" />
      <button style={{marginTop:8}} onClick={run} disabled={!prompt}>Run</button>
    </div>
  )
}
