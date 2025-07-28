/* ───────────────────────── gui/src/renderer/Marketplace.tsx
   Public Marketplace tab – Sprint-10
────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPublicTemplates, MarketplaceTemplate } from '@/services/marketplace'

/* ---------- helper components ------------------------------------------- */
function Star ({ filled }: { filled: boolean }) {
  return <span style={{ color: filled ? '#f6b73c' : '#ccc' }}>★</span>
}

function Rating ({ avg, count }: { avg: number; count: number }) {
  if (!count) return <span style={{ fontSize: 12 }}>—</span>
  const rounded = Math.round(avg)
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < rounded} />
      ))}
      <span style={{ fontSize: 12, marginLeft: 4 }}>({count})</span>
    </span>
  )
}

/* ---------- main component ---------------------------------------------- */
export default function Marketplace () {
  const [sort, setSort] = useState<'new' | 'top'>('new')

  const { data = [], isLoading } = useQuery({
    queryKey: ['marketplace', sort],
    queryFn: () => fetchPublicTemplates(sort),
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Marketplace</h1>

      {/* sort chips */}
      <div className="flex gap-2">
        {(['new', 'top'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`px-3 py-1 rounded-full text-sm border ${
              sort === key ? 'bg-blue-600 text-white' : 'border-gray-300'
            }`}
          >
            {key === 'new' ? 'Newest' : 'Top Rated'}
          </button>
        ))}
      </div>

      {/* table */}
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Title</th>
              <th className="text-left py-2">Tags</th>
              <th className="text-center py-2">Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tpl: MarketplaceTemplate) => (
              <tr key={tpl.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{tpl.title}</td>
                <td className="py-2">
                  {tpl.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-block bg-gray-200 text-xs px-2 py-0.5 rounded mr-1"
                    >
                      {t}
                    </span>
                  ))}
                </td>
                <td className="py-2 text-center">
                  <Rating avg={tpl.avgStars} count={tpl.ratingCount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
