/* ───────────────────────── renderer/Library.tsx
   Lists local + community templates with Run / Edit / Delete / Publish
────────────────────────────────────────────────────────────────── */

import React, { useState } from "react"
import { useQuery }        from "@tanstack/react-query"
import {
  fetchTemplates,
  deleteTemplate,
  TemplateJSON,
} from "@/services/templates"
import PublishDialog from "./PublishDialog"

/* ---------------------------------------------------------------- types */
interface Props {
  onRun : (tpl: TemplateJSON) => void
  onEdit: (tpl: TemplateJSON | null) => void
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

  const [toPublish, setToPublish] = useState<TemplateJSON | null>(null)

  async function handleDelete (tpl: TemplateJSON) {
    await deleteTemplate(tpl)
    void refetch()
  }

  /* money formatter */
  const price = (cents: number) =>
    cents ? `$${(cents / 100).toFixed(2)}` : "Free"

  /* reusable section */
  function Section (
    title: string,
    rows : TemplateJSON[],
    showCrud: boolean,   // Edit/Delete/Publish?
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
                    <button onClick={() => onRun(t)}>Run</button>{" "}
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
    </div>
  )
}
