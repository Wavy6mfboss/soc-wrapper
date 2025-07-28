/* ───────────────────────── renderer/PublishDialog.tsx
   “Publish” modal – lets owner push a local template to the public Marketplace
────────────────────────────────────────────────────────────────── */
import React, { useState } from "react"
import { publishTemplate }  from "@/services/marketplace"
import { TemplateJSON }     from "@/services/templates"

interface Props {
  tpl: TemplateJSON
  onClose: (published: boolean) => void   // published = true if success
}

export default function PublishDialog ({ tpl, onClose }: Props) {
  const [tags, setTags]   = useState(tpl.tags.join(", "))
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePublish () {
    setBusy(true)
    try {
      await publishTemplate({ ...tpl, tags: tags.split(",").map(t => t.trim()) })
      onClose(true)
    } catch (e: any) {
      setError(e.message ?? String(e))
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 360 }}>
        <h2>Publish “{tpl.title}”</h2>

        <label style={{ fontSize: 14 }}>
          Tags (comma-separated):
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button onClick={() => onClose(false)} disabled={busy} style={{ marginRight: 8 }}>
            Cancel
          </button>
          <button onClick={handlePublish} disabled={busy}>
            {busy ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  )
}
