/* ───────────────────────── renderer/TemplateEditor.tsx
   Editor – form stays editable after any Marketplace action
────────────────────────────────────────────────────────── */
import React, { useState } from 'react'
import { saveTemplate, TemplateJSON } from '@/services/templates'

export default function TemplateEditor ({
  editing,
  onClose,
}: {
  editing: TemplateJSON | null
  onClose: () => void
}) {
  const blank: TemplateJSON = {
    title: '', prompt: '', instructions: '',
    tags: [], price_cents: 0, version: 1, is_public: false,
  }

  // use editing once as initial state; no effect that overwrites later
  const [tpl, setTpl] = useState<TemplateJSON>(editing ?? blank)
  const [busy, setBusy] = useState(false)

  const bind = <K extends keyof TemplateJSON>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setTpl({ ...tpl, [k]:
        k === 'price_cents' ? Number(e.target.value)
      : k === 'version'     ? Number(e.target.value)
      : e.target.value } as TemplateJSON)

  const setTags = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTpl({ ...tpl, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })

  async function save () {
    setBusy(true)
    await saveTemplate(tpl)
    onClose()
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{editing ? 'Edit' : 'New'} Template</h2>

      <label>Title<br/><input value={tpl.title} onChange={bind('title')} style={{width:'100%'}}/></label><br/>
      <label>Prompt<br/><textarea value={tpl.prompt} onChange={bind('prompt')} style={{width:'100%',height:60}}/></label><br/>
      <label>Instructions<br/><textarea value={tpl.instructions} onChange={bind('instructions')} style={{width:'100%',height:90}}/></label><br/>
      <label>Tags (comma)<br/><input value={tpl.tags.join(', ')} onChange={setTags} style={{width:'100%'}}/></label><br/>
      <label>Price (cents)<br/><input type="number" value={tpl.price_cents} onChange={bind('price_cents')} style={{width:'100%'}}/></label><br/>
      <label>Version<br/><input type="number" value={Number(tpl.version)} onChange={bind('version')} style={{width:'100%'}}/></label><br/>

      <div style={{marginTop:16,textAlign:'right'}}>
        <button onClick={onClose} disabled={busy} style={{marginRight:8}}>Cancel</button>
        <button onClick={save} disabled={busy}>{busy?'Saving…':'Save'}</button>
      </div>
    </div>
  )
}
