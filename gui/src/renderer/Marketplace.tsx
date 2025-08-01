/* ───────────────────────── renderer/Marketplace.tsx
   Marketplace list – Download duplicates template
────────────────────────────────────────────────────────── */
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchPublicTemplates,
  publishLocalCopy,
  MarketplaceTemplate,
} from '../services/marketplace'
import { supabase } from '../services/templates'

export default function Marketplace () {
  const [sort , setSort ] = useState<'new'|'top'>('new')
  const [filter,setFilter] = useState<'all'|'free'|'paid'>('all')

  const { data:rows=[] , refetch } = useQuery({
    queryKey:['market', sort],
    queryFn : () => fetchPublicTemplates(sort),
  })

  const userId = supabase.auth.user()?.id ?? null
  const price  = (c:number)=> c ? `$${(c/100).toFixed(2)}` : 'Free'

  /* UI helpers */
  const chip = (txt:string,a:boolean,fn:()=>void)=>(
    <button onClick={fn}
      style={{marginRight:8,padding:'4px 10px',borderRadius:20,
              background:a?'#222':'#eee',color:a?'#fff':'#000',border:'none'}}>
      {txt}
    </button>)

  const filtered = rows.filter(r =>
         filter==='all'  ? true
      :  filter==='free' ? r.price_cents === 0
      :                    r.price_cents  > 0)

  async function handleDownload(tpl:MarketplaceTemplate){
    if(!userId){ alert('Please log in'); return }
    const { error } = await publishLocalCopy(tpl, userId)
    if(error){ alert('Download failed'); return }
    window.electron.templateSaved()   // trigger Library refetch
    alert('Added to your Library ✔')
  }

  return(
    <div style={{maxWidth:900}}>
      <h1>Marketplace</h1>

      <div style={{marginBottom:16}}>
        {chip('Newest',sort==='new',()=>setSort('new'))}
        {chip('Top Rated',sort==='top',()=>setSort('top'))}
        {' | '}
        {chip('All',filter==='all',()=>setFilter('all'))}
        {chip('Free',filter==='free',()=>setFilter('free'))}
        {chip('Paid',filter==='paid',()=>setFilter('paid'))}
      </div>

      {filtered.length===0 ? <p style={{fontStyle:'italic'}}>No templates.</p>
      :(<table style={{borderSpacing:8}}>
        <thead><tr>
          <th align="left">Title</th><th>Tags</th><th>Price</th><th>★</th><th/></tr></thead>
        <tbody>{filtered.map(t=>(
          <tr key={t.id}>
            <td>{t.title}</td>
            <td>{t.tags.join(', ')}</td>
            <td>{price(t.price_cents)}</td>
            <td>{t.ratingCount?`★${t.avgStars.toFixed(1)} (${t.ratingCount})`:'—'}</td>
            <td>
              {t.price_cents===0
                ?<button onClick={()=>handleDownload(t)}>Download</button>
                :<button disabled>Buy (stub)</button>}
            </td>
          </tr>
        ))}</tbody>
      </table>)}
    </div>
  )
}
