/* ───────────────────────── renderer/Library.tsx
   Run | Edit | Delete + Rating modal after 2 runs
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchTemplates,
  deleteTemplate,
  TemplateJSON,
  supabase,
} from '../services/templates'
import RatingPrompt from './RatingPrompt'

export default function Library ({ onRun }:{ onRun:(t:TemplateJSON)=>void }) {
  const qc   = useQueryClient()
  const { data:rows=[] } = useQuery({ queryKey:['templates'], queryFn: fetchTemplates })

  /* current user (may be null) */
  const [uid,setUid] = useState<string|null>(null)
  useEffect(()=>{ supabase.auth.getUser().then(r=>setUid(r.data.user?.id??null)) },[])

  /* refresh whenever editor saves */
  useEffect(()=> window.electron.onTemplateSaved(
    () => qc.invalidateQueries({ queryKey:['templates'] })
  ), [])

  /* local run-counter → rating modal */
  const KEY = 'soc-run-counts-v1'
  const bump = (id:string)=>
    { const m=JSON.parse(localStorage.getItem(KEY)||'{}'); m[id]=(m[id]??0)+1;
      localStorage.setItem(KEY,JSON.stringify(m)); return m[id] }

  const [rate,setRate] = useState<string|null>(null)

  async function handleRun(t:TemplateJSON){
    await onRun(t)
    const orig = (t.source_id as string|undefined) ?? (t.id as string)
    if(!orig) return

    const isOwner = t.owner_id && uid && t.owner_id === uid
    if(isOwner) return

    if(bump(orig) >= 2) setRate(orig)
  }

  async function handleDelete(t:TemplateJSON){
    await deleteTemplate(t)
    qc.invalidateQueries({ queryKey:['templates'] })
  }

  /* split lists */
  const created  = rows.filter(t=>!t.source_id)
  const downloads= rows.filter(t=> t.source_id)

  const price = (c:number)=> c?`$${(c/100).toFixed(2)}`:'Free'
  const Row = (t:TemplateJSON,label:string)=>(<tr key={t.id}>
    <td>{label==='created'?'📝':'⬇️'} {t.title}</td>
    <td>{price(t.price_cents)}</td>
    <td>
      <button onClick={()=>handleRun(t)}>Run</button>{' '}
      <button onClick={()=>window.electron.openEditor(t)}>Edit</button>{' '}
      <button onClick={()=>handleDelete(t)}>Delete</button>
    </td>
  </tr>)

  return (
    <div style={{maxWidth:900}}>
      <h1>My Library</h1>

      <h3>Created</h3>
      <table style={{borderSpacing:8}}>
        <tbody>{created.map(t=>Row(t,'created'))}</tbody>
      </table>

      <h3 style={{marginTop:32}}>Downloads</h3>
      <table style={{borderSpacing:8}}>
        <tbody>{downloads.map(t=>Row(t,'downloaded'))}</tbody>
      </table>

      {rate && <RatingPrompt templateId={rate} onClose={()=>setRate(null)} />}
    </div>
  )
}
