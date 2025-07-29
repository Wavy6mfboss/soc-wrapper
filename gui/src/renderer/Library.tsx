/* ───────────────────────── renderer/Library.tsx
   Lists templates, handles Run / Edit / Delete / Publish / Rate
──────────────────────────────────────────────────────────────── */
import React, { useState } from "react"
import { useQuery }        from "@tanstack/react-query"
import {
  fetchTemplates,
  deleteTemplate,
  TemplateJSON,
} from "@/services/templates"
import PublishDialog from "./PublishDialog"
import RatingPrompt  from "./RatingPrompt"

/* ---------------------------------------------------------------- types */
interface Props {
  onRun : (tpl: TemplateJSON) => void
  onEdit: (tpl: TemplateJSON | null) => void
}

/* ---------------------------------------------------------------- constants */
const RUN_COUNT_KEY = "soc-wrapper-run-counts-v1" // { [tplId]: number }

/* ---------------------------------------------------------------- helpers */
function incRunCount (id: number) {
  const map = JSON.parse(localStorage.getItem(RUN_COUNT_KEY) ?? "{}")
  map[id] = (map[id] ?? 0) + 1
  localStorage.setItem(RUN_COUNT_KEY, JSON.stringify(map))
  return map[id]
}
function clearRunCount (id: number) {
  const map = JSON.parse(localStorage.getItem(RUN_COUNT_KEY) ?? "{}")
  delete map[id]
  localStorage.setItem(RUN_COUNT_KEY, JSON.stringify(map))
}

/* ---------------------------------------------------------------- component */
export default function Library ({ onRun, onEdit }: Props) {
  const {
    data: templates = [],
    isLoading,
    refetch,
  } = useQuery({ queryKey: ["templates"], queryFn: fetchTemplates })

  const locals    = templates.filter((t) => !t.is_public)
  const community = templates.filter((t) =>  t.is_public)

  const [toPublish, setToPublish]   = useState<TemplateJSON | null>(null)
  const [rateId, setRateId]         = useState<number | null>(null)

  async function handleDelete (tpl: TemplateJSON) {
    await deleteTemplate(tpl)
    void refetch()
  }

  async function handleRun (tpl: TemplateJSON) {
    await onRun(tpl)
    if (!tpl.id) return
    const runs = incRunCount(tpl.id)
    if (runs >= 2) setRateId(tpl.id)
  }

  const price = (cents: number) =>
    cents ? `$${(cents / 100).toFixed(2)}` : "Free"

  function Section (
    title: string,
    rows : TemplateJSON[],
    showCrud: boolean,
  ) {
    return (
      <>
        <h3 style={{ marginTop: 32 }}>{title}</h3>
        {rows.length === 0 ? (
          <p style={{ fontStyle: "italic" }}>None yet.</p>
        ) : (
          <table style={{ borderSpacing: 8 }}>
            <thead>
              <tr>
                <th align="left">Title</th>
                <th align="left">Tags</th>
                <th align="left">Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={(t.id ?? t.title) + (t.is_public ? "pub" : "loc")}>
                  <td>{t.title}</td>
                  <td>{t.tags.join(", ")}</td>
                  <td>{price(t.price_cents)}</td>
                  <td>
                    <button onClick={() => handleRun(t)}>Run</button>{" "}
                    {showCrud && (
                      <>
                        <button onClick={() => onEdit(t)}>Edit</button>{" "}
                        <button onClick={() => handleDelete(t)}>Delete</button>{" "}
                        <button onClick={() => setToPublish(t)}>Publish</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    )
  }

  if (isLoading) return <p>Loading templates…</p>

  return (
    <div style={{ maxWidth: 900, paddingBottom: 48 }}>
      <h1>Library</h1>

      <button onClick={() => onEdit(null)} style={{ marginBottom: 24 }}>
        + New Template
      </button>

      {Section("My Automations", locals, true)}
      <hr style={{ margin: "40px 0" }} />
      {Section("Community", community, false)}

      {/* Publish modal */}
      {toPublish && (
        <PublishDialog
          tpl={toPublish}
          onClose={(published) => {
            setToPublish(null)
            if (published) void refetch()
          }}
        />
      )}

      {/* Rating modal */}
      {rateId && (
        <RatingPrompt
          templateId={rateId}
          onClose={() => {
            clearRunCount(rateId)
            setRateId(null)
          }}
        />
      )}
    </div>
  )
}
