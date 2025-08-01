/* ───────────────────────── renderer/RatingPrompt.tsx
   Rating modal – stars update immediately & stay in sync
────────────────────────────────────────────────────────── */
import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import StarRating from './StarRating'
import { submitRating } from '@/services/ratings'

export default function RatingPrompt ({
  templateId,
  onClose,
}: {
  templateId: string            // may be bigint or uuid → treat as string
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [stars, setStars]     = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy]       = useState(false)

  /* ----- optimistic cache patch ------------------------------------ */
  function patchMarketplaceCaches () {
    const updater = (rows: any[]) =>
      rows.map((r) =>
        String(r.id) === String(templateId)
          ? {
              ...r,
              ratingCount: (r.ratingCount ?? 0) + 1,
              avgStars:
                ((r.avgStars ?? 0) * (r.ratingCount ?? 0) + stars) /
                ((r.ratingCount ?? 0) + 1),
            }
          : r
      )

    qc.getQueryCache()
      .findAll({ predicate: (q) => q.queryKey[0] === 'market' })
      .forEach((q) => {
        qc.setQueryData(q.queryKey, (old: any) =>
          Array.isArray(old) ? updater(old) : old
        )
      })
  }

  async function handleSubmit () {
    if (!stars) return
    setBusy(true)

    /* 1 — optimistic UI update */
    patchMarketplaceCaches()

    /* 2 — write to Supabase */
    await submitRating(templateId, stars, comment).catch((e) =>
      console.error('[rating] submit failed →', e)
    )

    /* 3 — refetch every Marketplace list to pick up server truth */
    await qc.invalidateQueries({
      predicate: (q) => q.queryKey[0] === 'market',
    })
    await qc.refetchQueries({
      predicate: (q) => q.queryKey[0] === 'market',
      type: 'all',
    })

    onClose()
  }

  /* ----- UI --------------------------------------------------------- */
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 360 }}>
        <h2>Rate this Automation</h2>

        <StarRating value={stars} onChange={setStars} />

        <textarea
          placeholder="Optional comment…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ width: '100%', marginTop: 12, minHeight: 60 }}
        />

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button onClick={onClose} disabled={busy} style={{ marginRight: 8 }}>
            Skip
          </button>
          <button onClick={handleSubmit} disabled={busy || !stars}>
            {busy ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
