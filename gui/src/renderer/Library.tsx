/* ───────────────────────── renderer/Library.tsx
   My Library – badges, self-rating guard, publish & run
──────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchTemplates,
  deleteTemplate,
  TemplateJSON,
  supabase,
} from '@/services/templates'
import PublishDialog from './PublishDialog'
import RatingPrompt  from './RatingPrompt'

interface Props {
  onRun : (tpl: TemplateJSON) => void
  onEdit: (tpl: TemplateJSON | null) => void
}

/* run-count storage */
const RUN_KEY = 'soc-wrapper-run-counts-v1'
function bumpRun (id: number) {
  const m = JSON.parse(localStorage.getItem(RUN_KEY) ?? '{}')
  m[id] = (m[id] ?? 0) + 1
  localStorage.setItem(RUN_KEY, JSON.stringify(m))
  return m[id]
}
function clearRun (id: number) {
  const m = JSON.parse(localStorage.getItem(RUN_KEY) ?? '{}')
  delete m[id]
  localStorage.setItem(RUN_KEY, JSON.stringify(m))
}

const ALLOW_SELF = import.meta.env.ALLOW_SELF_RATING === 'true'

export default function Library ({ onRun, onEdit }: Props) {
  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ['templates'],
    queryFn : fetchTemplates,
  })

  /* split lists */
  const created    = templates.filter(t => !t.source_id)
  const downloaded = templates.filter(t => t.source_id != null)

  /* auth uid */
  const [uid, setUid] = useState<string | null>(null)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null))
  }, [])

  /* dialogs */
  const [pub,  setPub]  = useState<TemplateJSON | null>(null)
  const [rate, setRate] = useState<{ id: number, original: number } | null>(null)

  const price = (c: number) => (c ? `$${(c / 100).toFixed(2)}` : 'Free')

  async function handleRun (tpl: TemplateJSON) {
    await onRun(tpl)
    if (!tpl.id) return
    if (tpl.owner_id === uid && !ALLOW_SELF) return   // self-rating guard

    /* use original id when rating a local copy */
    const originalId = tpl.source_id ?? tpl.id
    const runs = bumpRun(originalId)
    if (runs >= 2) setRate({ id: tpl.id, original: originalId })
  }

  async function handleDelete (tpl: TemplateJSON) {
    await deleteTemplate(tpl)
    void refetch()
  }

  const Badge = ({ label }: { label: string }) => (
    <span style={{
      background:'#eee',fontSize:11,padding:'2px 6px',
      borderRadius:4,marginRight:6,textTransform:'uppercase'}}>
      {label}
    </span>
  )

  const Row = (t: TemplateJSON, canCrud: boolean, label: string) => (
    <tr key={t.id ?? t.title}>
      <td>
        <Badge label={label} /> {t.title}
      </td>
      <td>{t.tags.join(', ')}</td>
      <td>{price(t.price_cents)}</td>
      <td>
        <button onClick={() => handleRun(t)}>Run</button>{' '}
        {canCrud && (
          <>
            <button onClick={() => onEdit(t)}>Edit</button>{' '}
            <button onClick={() => handleDelete(t)}>Delete</button>{' '}
            <button onClick={() => setPub(t)}>Publish</button>
          </>
        )}
      </td>
    </tr>
  )

  if (isLoading) return <p>Loading templates…</p>

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>My Library</h1>

      <button onClick={() => onEdit(null)} style={{ margin: '16px 0' }}>
        + New Template
      </button>

      {/* My creations */}
      <h3>Created</h3>
      <table style={{ borderSpacing: 8 }}>
        <thead><tr><th align="left">Title</th><th>Tags</th><th>Price</th><th /></tr></thead>
        <tbody>{created.map(t => Row(t, true, 'created'))}</tbody>
      </table>

      {/* Downloads / Purchases */}
      {downloaded.length > 0 && (
        <>
          <hr style={{ margin: '32px 0' }} />
          <h3>Downloads</h3>
          <table style={{ borderSpacing: 8 }}>
            <thead><tr><th align="left">Title</th><th>Tags</th><th>Price</th><th /></tr></thead>
            <tbody>{downloaded.map(t =>
              Row(t, false, t.price_cents ? 'purchased' : 'downloaded'))}
            </tbody>
          </table>
        </>
      )}

      {/* dialogs */}
      {pub && (
        <PublishDialog
          tpl={pub}
          onClose={(done) => { setPub(null); if (done) void refetch() }}
        />
      )}
      {rate && (
        <RatingPrompt
          templateId={rate.original}
          onClose={() => { clearRun(rate.original); setRate(null) }}
        />
      )}
    </div>
  )
}
