/* ───────────────────────── renderer/TemplateEditor.tsx
   Controlled form – always editable, resets on prop change
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
  const blank: TemplateJSON = {
    title: '', prompt: '', instructions: '',
    tags: [], price_cents: 0, version: 1, is_public: false,
  }

  /* Controlled state */
  const [tpl, setTpl] = useState<TemplateJSON>(editing ?? blank)

  /* Reset the form any time editing.id changes */
  useEffect(() => {
    setTpl(editing ?? blank)
  }, [editing?.id])

  const set = <K extends keyof TemplateJSON>(k: K) =>
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
        <input value={tpl.title} onChange={set('title')} style={{width:'100%'}}/>
      </label><br/>

      <label>Prompt<br/>
        <textarea value={tpl.prompt} onChange={set('prompt')}
                  style={{width:'100%',height:60}}/>
      </label><br/>

      <label>Instructions<br/>
        <textarea value={tpl.instructions} onChange={set('instructions')}
                  style={{width:'100%',height:90}}/>
      </label><br/>

      <label>Tags (comma)<br/>
        <input value={tpl.tags.join(', ')} onChange={setTags} style={{width:'100%'}}/>
      </label><br/>

      <label>Price (cents)<br/>
        <input type="number" value={tpl.price_cents}
               onChange={set('price_cents')} style={{width:'100%'}}/>
      </label><br/>

      <label>Version<br/>
        <input type="number" value={Number(tpl.version)}
               onChange={set('version')} style={{width:'100%'}}/>
      </label><br/>

      <div style={{marginTop:16,textAlign:'right'}}>
        <button onClick={onClose} style={{marginRight:8}}>Cancel</button>
        <button onClick={save}>Save</button>
      </div>
    </div>
  )
}
