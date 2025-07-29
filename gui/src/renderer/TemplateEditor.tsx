/* ───────────────────────── renderer/TemplateEditor.tsx
   Stand-alone editor – fully controlled, always editable
────────────────────────────────────────────────────────── */
import React, { useState, useEffect } from 'react'
import { saveTemplate, TemplateJSON } from '@/services/templates'

export default function TemplateEditor({
  editing,
  onClose,
}: {
  editing: TemplateJSON | null
  onClose: () => void
}) {
  // blank template for “New”
  const blank: TemplateJSON = {
    title: '',
    prompt: '',
    instructions: '',
    tags: [],
    price_cents: 0,
    version: 1,
    is_public: false,
  }

  // Controlled state, reset whenever `editing` changes
  const [tpl, setTpl] = useState<TemplateJSON>(editing ?? blank)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // reset form each time we get a new template to edit
    setTpl(editing ?? blank)
  }, [editing])

  // Generic binder for most fields
  const bind = <K extends keyof TemplateJSON>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setTpl({
        ...tpl,
        [key]:
          key === 'price_cents'
            ? Number(e.target.value)
            : key === 'version'
            ? Number(e.target.value) || tpl.version
            : e.target.value,
      } as TemplateJSON)

  // Tags as comma-separated string
  const setTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTpl({
      ...tpl,
      tags: e.target.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  async function handleSave() {
    setBusy(true)
    await saveTemplate(tpl)
    onClose()
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{editing ? 'Edit' : 'New'} Template</h2>

      <label>Title<br />
        <input
          value={tpl.title}
          onChange={bind('title')}
          style={{ width: '100%' }}
        />
      </label><br />

      <label>Prompt<br />
        <textarea
          value={tpl.prompt}
          onChange={bind('prompt')}
          style={{ width: '100%', height: 60 }}
        />
      </label><br />

      <label>Instructions<br />
        <textarea
          value={tpl.instructions}
          onChange={bind('instructions')}
          style={{ width: '100%', height: 90 }}
        />
      </label><br />

      <label>Tags (comma separated)<br />
        <input
          value={tpl.tags.join(', ')}
          onChange={setTags}
          style={{ width: '100%' }}
        />
      </label><br />

      <label>Price (cents)<br />
        <input
          type="number"
          value={tpl.price_cents}
          onChange={bind('price_cents')}
          style={{ width: '100%' }}
        />
      </label><br />

      <label>Version<br />
        <input
          type="number"
          value={typeof tpl.version === 'number' ? tpl.version : Number(tpl.version)}
          onChange={bind('version')}
          style={{ width: '100%' }}
        />
      </label><br />

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <button onClick={onClose} disabled={busy} style={{ marginRight: 8 }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
