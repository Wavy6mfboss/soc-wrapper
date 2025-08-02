/* ───────────────────────── renderer/Library.tsx
   My Library – run-counter + single-rating guard
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchTemplates,
  deleteTemplate,
  TemplateJSON,
  supabase,
} from '@/services/templates'
import PublishDialog  from './PublishDialog'
import RatingPrompt   from './RatingPrompt'
import { hasUserRated } from '@/services/ratings'

/* ---------- props --------------------------------------- */
interface Props {
  onRun : (tpl: TemplateJSON) => Promise<void> | void
  onEdit: (tpl: TemplateJSON | null) => void
}

/* ---------- local run counter --------------------------- */
const CNT_KEY = 'soc-run-counts-v1'
function bumpRun (id: string) {
  const m = JSON.parse(localStorage.getItem(CNT_KEY) ?? '{}')
  m[id] = (m[id] ?? 0) + 1
  localStorage.setItem(CNT_KEY, JSON.stringify(m))
  return m[id]
}

/* ---------- component ----------------------------------- */
export default function Library ({ onRun, onEdit }: Props) {
  const qc = useQueryClient()

  /* templates list */
  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ['templates'],
    queryFn : fetchTemplates,
  })

  /* auth */
  const [uid, setUid] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    supabase.auth.getUser().then(r => setUid(r.data.user?.id ?? null))
  }, [])

  /* local sections */
  const mine       = templates.filter(t => (t.owner_id ?? null) === uid)
  const created    = mine.filter(t => !t.source_id)
  const downloads  = mine.filter(t =>  t.source_id)

  /* dialogs */
  const [pub,  setPub ] = useState<TemplateJSON | null>(null)
  const [rate, setRate] = useState<string | null>(null) // templateId to rate

  /* run handler with rating logic */
  async function handleRun (tpl: TemplateJSON) {
    await onRun(tpl)
    const id = String(tpl.source_id ?? tpl.id!)
    const count = bumpRun(id)

    if (count === 2 && !(await hasUserRated(id))) setRate(id)
  }

  /* helpers */
  const price = (c: number) => (c ? `$${(c / 100).toFixed(2)}` : 'Free')
  async function del (tpl: TemplateJSON) {
    await deleteTemplate(tpl)
    void refetch();               // refresh list
  }

  /* row renderer */
  function Row (t: TemplateJSON, badge: string) {
    return (
      <tr key={t.id ?? t.title}>
        <td>
          <span style={{
            background:'#eee',fontSize:11,padding:'2px 6px',
            borderRadius:4,marginRight:6,textTransform:'uppercase',
          }}>{badge}</span>
          {t.title}
        </td>
        <td>{t.tags.join(', ')}</td>
        <td>{price(t.price_cents)}</td>
        <td>
          <button onClick={() => handleRun(t)}>Run</button>{' '}
          <button onClick={() => onEdit(t)}>Edit</button>{' '}
          <button onClick={() => del(t)}>Delete</button>{' '}
          {badge === 'created' && (
            <button onClick={() => setPub(t)}>Publish</button>
          )}
        </td>
      </tr>
    )
  }

  if (isLoading || uid === undefined) return <p>Loading…</p>

  return (
    <div style={{ maxWidth: 900, paddingBottom: 48 }}>
      <h1>My Library</h1>

      <button onClick={() => onEdit(null)} style={{ margin: '16px 0' }}>
        + New Template
      </button>

      <h3>Created</h3>
      <table style={{ borderSpacing: 8 }}>
        <thead><tr><th>Title</th><th>Tags</th><th>Price</th><th /></tr></thead>
        <tbody>{created.map(t => Row(t, 'created'))}</tbody>
      </table>

      {downloads.length > 0 && (
        <>
          <hr style={{ margin: '32px 0' }} />
          <h3>Downloads</h3>
          <table style={{ borderSpacing: 8 }}>
            <thead><tr><th>Title</th><th>Tags</th><th>Price</th><th /></tr></thead>
            <tbody>{downloads.map(t => Row(t, 'downloaded'))}</tbody>
          </table>
        </>
      )}

      {pub  && <PublishDialog tpl={pub}    onClose={() => setPub(null)} />}
      {rate && (
        <RatingPrompt
          templateId={rate}
          onClose={() => setRate(null)}
        />
      )}
    </div>
  )
}
