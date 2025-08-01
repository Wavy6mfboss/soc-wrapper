/* ───────────────────────── renderer/EditorWindow.tsx
   Modal editor – no process.argv (works with nodeIntegration=false)
────────────────────────────────────────────────────────── */
import React, { useRef } from 'react'
import { saveTemplate, TemplateJSON } from '../services/templates'

/* main process injects the JSON on creation */
declare global { interface Window { _EDITOR_DATA?:string } }
const editing:TemplateJSON = window._EDITOR_DATA
  ? JSON.parse(window._EDITOR_DATA)
  : { id:'', title:'', prompt:'', instructions:'', tags:[], price_cents:0,
      version:1, is_public:false }

export default function EditorWindow () {
  const rTitle = useRef<HTMLInputElement>(null)
  const rPrompt= useRef<HTMLTextAreaElement>(null)
  const rInstr = useRef<HTMLTextAreaElement>(null)
  const rTags  = useRef<HTMLInputElement>(null)

  async function save () {
    await saveTemplate({
      ...editing,
      title : rTitle.current!.value,
      prompt: rPrompt.current!.value,
      instructions: rInstr.current!.value,
      tags  : rTags.current!.value.split(',').map(s=>s.trim()).filter(Boolean),
    })
    window.close()
  }

  return (
    <div style={{padding:24,fontFamily:'sans-serif',width:560}}>
      <h2>Edit Template</h2>

      <label>Title<br/>
        <input defaultValue={editing.title} ref={rTitle} autoFocus style={{width:'100%'}}/>
      </label><br/>

      <label>Prompt<br/>
        <textarea defaultValue={editing.prompt} ref={rPrompt}
                  style={{width:'100%',height:60}}/>
      </label><br/>

      <label>Instructions<br/>
        <textarea defaultValue={editing.instructions} ref={rInstr}
                  style={{width:'100%',height:90}}/>
      </label><br/>

      <label>Tags (comma)<br/>
        <input defaultValue={editing.tags.join(', ')} ref={rTags}
               style={{width:'100%'}}/>
      </label><br/>

      <div style={{marginTop:16,textAlign:'right'}}>
        <button onClick={()=>window.close()} style={{marginRight:8}}>Cancel</button>
        <button onClick={save}>Save</button>
      </div>
    </div>
  )
}
