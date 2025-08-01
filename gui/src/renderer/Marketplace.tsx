/* ───────────────────────── renderer/Marketplace.tsx
   Marketplace view – deduped downloads
────────────────────────────────────────────────────────── */
import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchPublicTemplates,
  publishLocalCopy,
} from '../services/marketplace'
import {
  supabase, saveTemplate, TemplateJSON,
} from '../services/templates'

export default function Marketplace () {
  const qc = useQueryClient()

  const { data: rows = [] } = useQuery({
    queryKey: ['marketplace'],
    queryFn : () => fetchPublicTemplates('new'),
  })

  /* helper: ensure only one local copy per source_id */
  function downloadLocally (tpl: TemplateJSON) {
    const key = 'soc-wrapper-templates-v1'
    const list: TemplateJSON[] = JSON.parse(localStorage.getItem(key) ?? '[]')

    /* already have it? */
    if (list.some(r => r.source_id === tpl.id)) return

    list.push({
      ...tpl,
      id        : crypto.randomUUID(),
      source_id : tpl.id,
      owner_id  : null,
      is_public : false,
    })
    localStorage.setItem(key, JSON.stringify(list))
  }

  async function handleDownload (tpl: TemplateJSON) {
    const { data: auth } = await supabase.auth.getUser()

    if (!auth.user) {
      downloadLocally(tpl)
      window.alert('Added to your Library (local copy)')
      qc.invalidateQueries({ queryKey:['templates'] })
      return
    }

    try {
      await publishLocalCopy(tpl, auth.user.id)
      window.alert('Added to your Library')
      qc.invalidateQueries({ queryKey:['templates'] })
    } catch (err) {
      console.error(err)
      window.alert('Download failed')
    }
  }

  const price = (c:number)=> c ? `$${(c/100).toFixed(2)}` : 'Free'

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Marketplace</h1>

      <table style={{ borderSpacing: 8 }}>
        <thead>
          <tr><th>Title</th><th>Tags</th><th>Price</th><th/></tr>
        </thead>
        <tbody>
          {rows.map(t => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.tags.join(', ')}</td>
              <td>{price(t.price_cents)}</td>
              <td>
                <button onClick={() => handleDownload(t)}>
                  {t.price_cents ? 'Buy' : 'Download'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
