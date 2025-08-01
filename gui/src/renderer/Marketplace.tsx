/* ───────────────────────── renderer/Marketplace.tsx
   Marketplace list – “Download” now uses publishLocalCopy
────────────────────────────────────────────────────────── */
import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPublicTemplates, publishLocalCopy } from '../services/marketplace'
import { supabase } from '../services/templates'

export default function Marketplace () {
  const qc = useQueryClient()
  const { data: rows = [] } = useQuery({
    queryKey: ['marketplace'],
    queryFn : () => fetchPublicTemplates('new'),
  })

  async function handleDownload (tpl) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) { window.alert('Please log in'); return }

    try {
      await publishLocalCopy(tpl, data.user.id)
      window.alert('Added to your Library')
      qc.invalidateQueries({ queryKey:['templates'] })   // refresh Library
    } catch (err) {
      console.error(err)
      window.alert('Download failed')
    }
  }

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
              <td>{t.price_cents ? `$${(t.price_cents/100).toFixed(2)}` : 'Free'}</td>
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
