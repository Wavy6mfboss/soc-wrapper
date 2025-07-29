/* ───────────────────────── renderer/Library.tsx
   My Library – created vs. downloaded/purchased, all editable
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

/* run-count local store */
const RUN_KEY = 'soc-wrapper-run-counts-v1'
const bumpRun = (id: number) => {
  const m = JSON.parse(localStorage.getItem(RUN_KEY) ?? '{}')
  m[id] = (m[id] ?? 0) + 1
  localStorage.setItem(RUN_KEY, JSON.stringify(m))
  return m[id]
}
const clearRun = (id: number) => {
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

  /* uid:  undefined → loading | null → anon | string → logged-in user */
  const [uid, setUid] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setUid(data.user?.id ?? null)
    )
  }, [])

  /* split once uid known */
  const owned       = uid == null ? [] : templates.filter(t => t.owner_id === uid)
  const created     = owned.filter(t => !t.source_id)
  const downloads   = owned.filter(t => t.source_id != null)

  /* dialogs */
  const [pub,  setPub]  = useState<TemplateJSON | null>(null)
  const [rate, setRate] = useState<{ id: number, original: number } | null>(null)

  const price = (c: number) => (c ? `$${(c / 100).toFixed(2)}` : 'Free')

  async function handleRun (tpl: TemplateJSON) {
    await onRun(tpl)
    if (!tpl.id) return
    if (tpl.owner_id === uid && !ALLOW_SELF) return

    const original = tpl.source_id ?? tpl.id
    if (bumpRun(original) >= 2) setRate({ id: tpl.id, original })
  }

  async function handleDelete (tpl: TemplateJSON) {
    await deleteTemplate(tpl)
    void refetch()
  }

  const Badge = ({ txt }: { txt: string }) => (
    <span style={{
      background:'#eee',fontSize:11,padding:'2px 6px',borderRadius:4,
      textTransform:'uppercase',marginRight:6}}>
      {txt}
    </span>
  )

  const Row = (t: TemplateJSON, label: string) => (
    <tr key={t.id ?? t.title}>
      <td><Badge txt={label} /> {t.title}</td>
      <td>{t.tags.join(', ')}</td>
      <td>{price(t.price_cents)}</td>
      <td>
        <button onClick={() => handleRun(t)}>Run</button>{' '}
        <button onClick={() => onEdit(t)}>Edit</button>{' '}
        <button onClick={() => handleDelete(t)}>Delete</button>{' '}
        {label === 'created' && <button onClick={() => setPub(t)}>Publish</button>}
      </td>
    </tr>
  )

  /* ←─── loading only while uid === undefined */
  if (isLoading || uid === undefined) return <p>Loading…</p>

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>My Library</h1>

      <button onClick={() => onEdit(null)} style={{ margin: '16px 0' }}>
        + New Template
      </button>

      <h3>Created</h3>
      <table style={{ borderSpacing: 8 }}>
        <thead><tr><th align="left">Title</th><th>Tags</th><th>Price</th><th /></tr></thead>
        <tbody>{created.map(t => Row(t, 'created'))}</tbody>
      </table>

      {downloads.length > 0 && (
        <>
          <hr style={{ margin: '32px 0' }} />
          <h3>Downloads & Purchases</h3>
          <table style={{ borderSpacing: 8 }}>
            <thead><tr><th align="left">Title</th><th>Tags</th><th>Price</th><th /></tr></thead>
            <tbody>{downloads.map(t =>
              Row(t, t.price_cents ? 'purchased' : 'downloaded'))}
            </tbody>
          </table>
        </>
      )}

      {pub && (
        <PublishDialog tpl={pub} onClose={(d) => { setPub(null); if (d) void refetch() }} />
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
