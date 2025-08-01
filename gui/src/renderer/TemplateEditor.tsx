/* ───────────────────────── renderer/TemplateEditor.tsx
   Controlled form – resets only when editing object changes
────────────────────────────────────────────────────────── */
import React, { useState, useEffect } from 'react'
import { saveTemplate, TemplateJSON } from '../services/templates'

export default function TemplateEditor ({
  editing,
  onClose,
}: {
  editing: TemplateJSON | null
  onClose: () => void
}) {
  console.log('[Editor] props.editing →', editing)

  const blank: TemplateJSON = {
    title: '', prompt: '', instructions: '',
    tags: [], price_cents: 0, version: 1, is_public: false,
  }

  const [tpl, setTpl] = useState<TemplateJSON>(editing ?? blank)

  /* 🔑 reset **only** when the object reference actually changes */
  useEffect(() => {
    setTpl(editing ?? blank)
  }, [editing])                // ← changed (was editing?.id)

  const bind = <K extends keyof TemplateJSON>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
      setTpl({ ...tpl,
        [k]: k === 'price_cents' ? Number(e.target.value)
            : k === 'version'     ? Number(e.target.value)
            : e.target.value,
      } as TemplateJSON)

  const setTags = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTpl({ ...tpl,
      tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean),
    })

  async function save () {
    await saveTemplate(tpl)
    onClose()
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{editing ? 'Edit' : 'New'} Template</h2>

      <label>Title<br/>
        <input value={tpl.title} onChange={bind('title')}
               style={{width:'100%'}}/>
      </label><br/>

      <label>Prompt<br/>
        <textarea value={tpl.prompt} onChange={bind('prompt')}
                  style={{width:'100%',height:60}}/>
      </label><br/>

      <label>Instructions<br/>
        <textarea value={tpl.instructions} onChange={bind('instructions')}
                  style={{width:'100%',height:90}}/>
      </label><br/>

      <label>Tags (comma)<br/>
        <input value={tpl.tags.join(', ')} onChange={setTags}
               style={{width:'100%'}}/>
      </label><br/>

      <label>Price (cents)<br/>
        <input type="number" value={tpl.price_cents}
               onChange={bind('price_cents')} style={{width:'100%'}}/>
      </label><br/>

      <label>Version<br/>
        <input type="number" value={Number(tpl.version)}
               onChange={bind('version')} style={{width:'100%'}}/>
      </label><br/>

      <div style={{marginTop:16,textAlign:'right'}}>
        <button onClick={onClose} style={{marginRight:8}}>Cancel</button>
        <button onClick={save}>Save</button>
      </div>
    </div>
  )
}
