/* ───────────────────────── renderer/Marketplace.tsx */
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/templates'
import {
  fetchPublicTemplates,
  publishLocalCopy,
  MarketplaceTemplate,
} from '@/services/marketplace'

type Filter = 'all' | 'free' | 'paid' | 'top'
const chips: Filter[] = ['all', 'free', 'paid', 'top']

export default function Marketplace () {
  const [filter, setFilter] = useState<Filter>('all')
  const [uid, setUid]       = useState<string | null>(null)
  const [busy, setBusy]     = useState<number | null>(null)

  /* fetch uid once */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null))
  }, [])

  /* list */
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['marketplace', filter, uid],
    queryFn : () => fetchPublicTemplates(
      filter === 'top' ? 'top' : 'new',
      uid ?? undefined,
    ),
  })

  const rows =
    filter === 'free' ? data.filter(t => t.price_cents === 0)
    : filter === 'paid' ? data.filter(t => t.price_cents > 0)
    : data

  /* -------- Download or Buy (works if uid is null) */
  async function handleDownload (tpl: MarketplaceTemplate) {
    if (busy) return
    setBusy(tpl.id!)
    const { error } = await publishLocalCopy(tpl, uid)
    setBusy(null)
    if (error) return alert(error.message)
    alert('Added to My Library.')
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Marketplace</h1>

      {/* chips */}
      <div className="flex gap-2">
        {chips.map(k => (
          <button key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === k ? 'bg-blue-600 text-white' : 'border-gray-300'
            }`}>
            {k === 'top' ? 'Top Rated'
              : k.charAt(0).toUpperCase() + k.slice(1)}
          </button>
        ))}
        <button onClick={() => refetch()} className="ml-auto text-sm underline">
          ↻ Refresh
        </button>
      </div>

      {isLoading ? <p>Loading…</p> : (
        <table className="w-full text-sm border-collapse">
          <thead><tr className="border-b">
            <th align="left">Title</th><th>Tags</th><th>★</th>
            <th align="right">Price</th><th align="right" /></tr></thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td>{t.title}</td>
                <td>{t.tags.join(', ')}</td>
                <td align="center">
                  {t.ratingCount ? `${t.avgStars.toFixed(1)} (${t.ratingCount})`
                                 : '—'}
                </td>
                <td align="right">
                  {t.price_cents
                    ? `$${(t.price_cents / 100).toFixed(2)}`
                    : 'Free'}
                </td>
                <td align="right">
                  {busy === t.id ? '…'
                    : t.price_cents === 0
                    ? <button onClick={() => handleDownload(t)}>Download</button>
                    : <button onClick={() => alert('Stripe Checkout TBD')}>
                        Buy
                      </button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
