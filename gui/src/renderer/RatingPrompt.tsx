/* ───────────────────────── renderer/RatingPrompt.tsx
   Rating modal – refetches all Marketplace queries
────────────────────────────────────────────────────────── */
import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import StarRating from './StarRating'
import { submitRating } from '@/services/ratings'

export default function RatingPrompt ({
  templateId,
  onClose,
}: {
  templateId: string
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [stars,   setStars]   = useState(0)
  const [comment, setComment] = useState('')
  const [busy,    setBusy]    = useState(false)

  async function handleSubmit () {
    if (!stars) return
    setBusy(true)
    try {
      await submitRating(templateId, stars, comment)
      /* refresh every Marketplace query (['market', ...]) */
      qc.invalidateQueries({ queryKey: ['market'], exact: false })
    } finally {
      onClose()
    }
  }

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
