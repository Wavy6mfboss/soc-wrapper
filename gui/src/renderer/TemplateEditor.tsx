/* ───────────────────────── renderer/TemplateEditor.tsx
   Double-focus trick – caret always visible
────────────────────────────────────────────────────────── */
import React, { useRef, useLayoutEffect } from 'react'
import { saveTemplate, TemplateJSON } from '../services/templates'

export default function TemplateEditor ({
  editing,
  onClose,
}: {
  editing: TemplateJSON | null
  onClose: () => void
}) {
  const blank: TemplateJSON = {
    title:'',prompt:'',instructions:'',tags:[],price_cents:0,version:1,is_public:false,
  }
  const tpl = editing ?? blank

  /* refs */
  const rTitle=useRef<HTMLInputElement>(null)
  const rPrompt=useRef<HTMLTextAreaElement>(null)
  const rInstr =useRef<HTMLTextAreaElement>(null)
  const rTags  =useRef<HTMLInputElement>(null)
  const rPrice =useRef<HTMLInputElement>(null)
  const rVer   =useRef<HTMLInputElement>(null)

  /* --- window + input focus ------------------------------------------ */
  useLayoutEffect(() => {
    window.electron.focusWindow()                    // focus entire Electron win

    const el = rTitle.current
    if (!el) return
    el.removeAttribute('readonly'); el.removeAttribute('disabled')

    /* click + focus twice (0ms & 150ms) so caret shows even on Windows */
    const poke = () => { el.click(); el.focus(); }
    poke()
    setTimeout(poke, 150)
  }, [editing])
  /* ------------------------------------------------------------------- */

  async function save () {
    await saveTemplate({
      ...tpl,
      title:rTitle.current!.value,
      prompt:rPrompt.current!.value,
      instructions:rInstr.current!.value,
      tags:rTags.current!.value.split(',').map(s=>s.trim()).filter(Boolean),
      price_cents:Number(rPrice.current!.value),
      version:Number(rVer.current!.value)||tpl.version,
    })
    onClose()
  }

  const field=(l:string,n:React.ReactNode)=>(<label style={{display:'block',marginBottom:8}}>{l}<br/>{n}</label>)

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{editing ? 'Edit' : 'New'} Template</h2>

      {field('Title', <input defaultValue={tpl.title} ref={rTitle} style={{width:'100%'}}/>)}
      {field('Prompt', <textarea defaultValue={tpl.prompt} ref={rPrompt} style={{width:'100%',height:60}}/>)}
      {field('Instructions', <textarea defaultValue={tpl.instructions} ref={rInstr} style={{width:'100%',height:90}}/>)}
      {field('Tags (comma)', <input defaultValue={tpl.tags.join(', ')} ref={rTags} style={{width:'100%'}}/>)}
      {field('Price (cents)', <input type="number" defaultValue={tpl.price_cents} ref={rPrice} style={{width:'100%'}}/>)}
      {field('Version', <input type="number" defaultValue={Number(tpl.version)} ref={rVer} style={{width:'100%'}}/>)}

      <div style={{marginTop:16,textAlign:'right'}}>
        <button onClick={onClose} style={{marginRight:8}}>Cancel</button>
        <button onClick={save}>Save</button>
      </div>
    </div>
  )
}
