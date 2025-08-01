/* ───────────────────────── renderer/TemplateEditor.tsx
   Uncontrolled form – stays editable after downloads
────────────────────────────────────────────────────────── */
import React, { useRef } from 'react'
import { saveTemplate, TemplateJSON } from '../services/templates'

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
  const tpl = editing ?? blank

  /* refs hold the current values – React never overwrites them */
  const rTitle = useRef<HTMLInputElement>(null)
  const rPrompt = useRef<HTMLTextAreaElement>(null)
  const rInstr = useRef<HTMLTextAreaElement>(null)
  const rTags  = useRef<HTMLInputElement>(null)
  const rPrice = useRef<HTMLInputElement>(null)
  const rVer   = useRef<HTMLInputElement>(null)

  async function handleSave () {
    const updated: TemplateJSON = {
      ...tpl,
      title       : rTitle.current!.value,
      prompt      : rPrompt.current!.value,
      instructions: rInstr.current!.value,
      tags        : rTags.current!.value
                     .split(',')
                     .map(s => s.trim())
                     .filter(Boolean),
      price_cents : Number(rPrice.current!.value),
      version     : Number(rVer.current!.value) || tpl.version,
    }
    await saveTemplate(updated)
    onClose()
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{editing ? 'Edit' : 'New'} Template</h2>

      <label>Title<br/>
        <input defaultValue={tpl.title} ref={rTitle} style={{ width: '100%' }}/>
      </label><br/>

      <label>Prompt<br/>
        <textarea defaultValue={tpl.prompt} ref={rPrompt}
                  style={{ width: '100%', height: 60 }}/>
      </label><br/>

      <label>Instructions<br/>
        <textarea defaultValue={tpl.instructions} ref={rInstr}
                  style={{ width: '100%', height: 90 }}/>
      </label><br/>

      <label>Tags (comma separated)<br/>
        <input defaultValue={tpl.tags.join(', ')} ref={rTags}
               style={{ width: '100%' }}/>
      </label><br/>

      <label>Price (cents)<br/>
        <input type="number" defaultValue={tpl.price_cents}
               ref={rPrice} style={{ width: '100%' }}/>
      </label><br/>

      <label>Version<br/>
        <input type="number" defaultValue={Number(tpl.version)}
               ref={rVer} style={{ width: '100%' }}/>
      </label><br/>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <button onClick={onClose} style={{ marginRight: 8 }}>Cancel</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  )
}
