/* ───────────────────────── renderer/Library.tsx
   Library – excludes public Marketplace rows
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchTemplates, deleteTemplate, TemplateJSON, supabase,
} from '../services/templates'
import PublishDialog from './PublishDialog'
import RatingPrompt  from './RatingPrompt'

interface Props { onRun:(t:TemplateJSON)=>void; onEdit:(t:TemplateJSON|null)=>void }

const RUN_KEY   = 'soc-wrapper-run-counts-v1'
const RATED_KEY = 'soc-wrapper-rated-v1'

const bumpRun=id=>{const m=JSON.parse(localStorage.getItem(RUN_KEY)??'{}');m[id]=(m[id]??0)+1;localStorage.setItem(RUN_KEY,JSON.stringify(m));return m[id]}
const clearRun=id=>{const m=JSON.parse(localStorage.getItem(RUN_KEY)??'{}');delete m[id];localStorage.setItem(RUN_KEY,JSON.stringify(m))}
const hasRated=id=>JSON.parse(localStorage.getItem(RATED_KEY)??'{}')[id]
const markRated=id=>{const m=JSON.parse(localStorage.getItem(RATED_KEY)??'{}');m[id]=true;localStorage.setItem(RATED_KEY,JSON.stringify(m))}

const ALLOW_SELF = import.meta.env.ALLOW_SELF_RATING==='true'

export default function Library({onRun,onEdit}:Props){
  const{data:list=[],isLoading,refetch}=useQuery({queryKey:['templates'],queryFn:fetchTemplates})
  const[uid,setUid]=useState<string|null|undefined>(undefined)
  useEffect(()=>{supabase.auth.getUser().then(r=>setUid(r.data.user?.id??null))},[])

  /* ----- NEW mine-filter ------------------------------------------------ */
  const mine = list.filter(t => {
    if (uid === undefined) return false                // still loading auth
    if (uid)            return t.owner_id === uid      // logged-in user ⇒ own rows
    /* anonymous user ⇒ only private rows (is_public false) */
    return !t.is_public
  })
  /* --------------------------------------------------------------------- */

  const created   = mine.filter(t => !t.source_id)
  const downloads = mine.filter(t =>  t.source_id)

  const[pub,setPub]=useState<TemplateJSON|null>(null)
  const[rate,setRate]=useState<string|null>(null)

  async function run(t:TemplateJSON){
    await onRun(t)
    const orig=t.source_id??t.id!
    if(hasRated(orig)) return
    const self=t.source_id==null&&(t.owner_id==uid||t.owner_id==null)
    if(self&&!ALLOW_SELF) return
    if(bumpRun(orig)>=2) setRate(orig)
  }
  async function del(t:TemplateJSON){ await deleteTemplate(t); refetch() }

  const price=c=>c?`$${(c/100).toFixed(2)}`:'Free'
  const badge=s=><span style={{background:'#eee',fontSize:11,padding:'2px 6px',borderRadius:4,marginRight:6,textTransform:'uppercase'}}>{s}</span>
  const Row=(t:TemplateJSON,lbl:string)=>(<tr key={t.id}>
    <td>{badge(lbl)}{t.title}</td><td>{t.tags.join(', ')}</td><td>{price(t.price_cents)}</td>
    <td>
      <button onClick={()=>run(t)}>Run</button>{' '}
      <button onClick={()=>onEdit(t)}>Edit</button>{' '}
      <button onClick={()=>del(t)}>Delete</button>{' '}
      {lbl==='created'&&<button onClick={()=>setPub(t)}>Publish</button>}
    </td>
  </tr>)

  if(isLoading||uid===undefined) return <p>Loading…</p>

  return(
    <div style={{maxWidth:900}}>
      <h1>My Library</h1>
      <button onClick={()=>onEdit(null)} style={{margin:'16px 0'}}>+ New Template</button>

      <h3>Created</h3>
      <table style={{borderSpacing:8}}>
        <thead><tr><th>Title</th><th>Tags</th><th>Price</th><th/></tr></thead>
        <tbody>{created.map(t=>Row(t,'created'))}</tbody>
      </table>

      {downloads.length>0&&<>
        <hr style={{margin:'32px 0'}}/><h3>Downloads & Purchases</h3>
        <table style={{borderSpacing:8}}>
          <thead><tr><th>Title</th><th>Tags</th><th>Price</th><th/></tr></thead>
          <tbody>{downloads.map(t=>Row(t,t.price_cents?'purchased':'downloaded'))}</tbody>
        </table>
      </>}

      {pub && <PublishDialog tpl={pub} onClose={()=>{setPub(null);refetch()}}/>}
      {rate&& <RatingPrompt templateId={rate} onRated={id=>{markRated(id);clearRun(id)}} onClose={()=>setRate(null)}/>}
    </div>
  )
}
