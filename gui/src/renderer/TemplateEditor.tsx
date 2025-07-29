/* ───────────────────────── renderer/TemplateEditor.tsx
   Stand-alone editor – fully controlled form, resets on each edit
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
  // Default blank template
  const blank: TemplateJSON = {
    title: '',
    prompt: '',
    instructions: '',
    tags: [],
    price_cents: 0,
    version: 1,
    is_public: false,
  }

  // Controlled state, resets when `editing` changes
  const [tpl, setTpl] = useState<TemplateJSON>(editing ?? blank)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // Reset form any time we get a new `editing` prop
    setTpl(editing ?? blank)
  }, [editing])

  // Generic setter for simple string/number fields
  const bind = <K extends keyof TemplateJSON>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setTpl({
        ...tpl,
        [key]:
          key === 'price_cents'
            ? Number(e.target.value)
            : key === 'version'
            ? isNaN(Number(e.target.value))
              ? tpl.version
              : Number(e.target.value)
            : e.target.value,
      } as TemplateJSON)

  // Special handler for tags (comma-separated)
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

      <label>
        Title<br />
        <input
          value={tpl.title}
          onChange={bind('title')}
          style={{ width: '100%' }}
        />
      </label>
      <br />

      <label>
        Prompt<br />
        <textarea
          value={tpl.prompt}
          onChange={bind('prompt')}
          style={{ width: '100%', height: 60 }}
        />
      </label>
      <br />

      <label>
        Instructions<br />
        <textarea
          value={tpl.instructions}
          onChange={bind('instructions')}
          style={{ width: '100%', height: 90 }}
        />
      </label>
      <br />

      <label>
        Tags (comma separated)<br />
        <input
          value={tpl.tags.join(', ')}
          onChange={setTags}
          style={{ width: '100%' }}
        />
      </label>
      <br />

      <label>
        Price (cents)<br />
        <input
          type="number"
          value={tpl.price_cents}
          onChange={bind('price_cents')}
          style={{ width: '100%' }}
        />
      </label>
      <br />

      <label>
        Version<br />
        <input
          type="number"
          value={tpl.version as number}
          onChange={bind('version')}
          style={{ width: '100%' }}
        />
      </label>
      <br />

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <button onClick={onClose} style={{ marginRight: 8 }} disabled={busy}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
