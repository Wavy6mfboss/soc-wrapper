/* ───────────────────────── renderer/Marketplace.tsx
   Download now requires login (RLS-safe) and handles errors
────────────────────────────────────────────────────────── */
import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchPublicTemplates,
  publishLocalCopy,
  MarketplaceTemplate,
} from '../services/marketplace'
import { supabase } from '../services/templates'

type Sort   = 'new' | 'top'
type Filter = 'all' | 'free' | 'paid'

export default function Marketplace () {
  const qc = useQueryClient()
  const [sort , setSort ] = useState<Sort>('new')
  const [filter,setFilter] = useState<Filter>('all')
  const [uid  , setUid  ] = useState<string|null>(null)

  /* v2 auth call ------------------------------------------------------ */
  useEffect(() => {
    supabase.auth.getUser().then(r => setUid(r.data.user?.id ?? null))
  }, [])

  /* fetch marketplace rows ------------------------------------------- */
  const { data:rows=[] } = useQuery({
    queryKey:['market', sort],
    queryFn : ()=>fetchPublicTemplates(sort),
  })

  /* helpers ----------------------------------------------------------- */
  const price = (c:number)=> c ? `$${(c/100).toFixed(2)}` : 'Free'
  const chip  = (txt:string,a:boolean,fn:()=>void)=>
    <button onClick={fn}
      style={{marginRight:8,padding:'4px 10px',borderRadius:20,
              background:a?'#222':'#eee',color:a?'#fff':'#000',border:'none'}}>
      {txt}
    </button>

  const list = rows.filter(r =>
         filter==='all'  ? true
      :  filter==='free' ? r.price_cents === 0
      :                    r.price_cents  > 0)

  /* download flow ----------------------------------------------------- */
  async function download(tpl:MarketplaceTemplate){
    if(!uid){ alert('Please log in to download'); return }

    const { error } = await publishLocalCopy(tpl, uid)
    if(error){
      console.error('[download] Supabase error →', error)
      alert('Download failed: '+ error.message)
      return
    }
    qc.invalidateQueries({ queryKey:['templates'] })   // refresh Library
    alert('Added to Library ✔')
  }

  /* render ------------------------------------------------------------ */
  return (
    <div style={{maxWidth:900}}>
      <h1>Marketplace</h1>

      {/* chips */}
      <div style={{marginBottom:16}}>
        {chip('Newest',    sort==='new', ()=>setSort('new'))}
        {chip('Top Rated', sort==='top', ()=>setSort('top'))}
        {' | '}
        {chip('All',  filter==='all',  ()=>setFilter('all'))}
        {chip('Free', filter==='free', ()=>setFilter('free'))}
        {chip('Paid', filter==='paid', ()=>setFilter('paid'))}
      </div>

      {list.length===0 ? <p style={{fontStyle:'italic'}}>No templates.</p>
      :(<table style={{borderSpacing:8}}>
        <thead><tr>
          <th align="left">Title</th><th>Tags</th><th>Price</th><th>★</th><th/></tr></thead>
        <tbody>{list.map(t=>(
          <tr key={t.id}>
            <td>{t.title}</td>
            <td>{t.tags.join(', ')}</td>
            <td>{price(t.price_cents)}</td>
            <td>{t.ratingCount
                ? `★${t.avgStars.toFixed(1)} (${t.ratingCount})`
                : '—'}</td>
            <td>
              {t.price_cents===0
                ? <button onClick={()=>download(t)}>Download</button>
                : <button disabled>Buy&nbsp;(stub)</button>}
            </td>
          </tr>
        ))}</tbody>
      </table>)}
    </div>
  )
}
