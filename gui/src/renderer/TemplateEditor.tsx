/* ───────────────────────── renderer/TemplateEditor.tsx */
import React, { useState, useEffect } from "react";
import {
  TemplateJSON,
  saveTemplate,          // ← this is the only service call we need
} from "../services/templates";

/* Props:
   • editing = existing template or null for “New”
   • onClose = callback after save/cancel */
interface Props {
  editing: TemplateJSON | null;
  onClose: () => void;
}

export default function TemplateEditor({ editing, onClose }: Props) {
  /* form state */
  const [title       , setTitle]        = useState("");
  const [prompt      , setPrompt]       = useState("");
  const [instructions, setInstructions] = useState("");
  const [tags        , setTags]         = useState("");
  const [priceCents  , setPriceCents]   = useState(0);
  const [saving      , setSaving]       = useState(false);

  /* load existing template into form */
  useEffect(() => {
    if (!editing) return;
    setTitle(editing.title);
    setPrompt(editing.prompt);
    setInstructions(editing.instructions);
    setTags(editing.tags.join(", "));
    setPriceCents(editing.price_cents);
  }, [editing]);

  /* handle save (insert or update) */
  async function handleSave() {
    if (!title.trim() || !prompt.trim()) {
      alert("Title and Prompt are required.");
      return;
    }

    const tpl: TemplateJSON = {
      ...editing,                       // keeps id/creator/version if editing
      title       : title.trim(),
      prompt      : prompt.trim(),
      instructions: instructions.trim(),
      tags        : tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
      price_cents : priceCents,
      version     : editing?.version ?? "1.0.0",
      is_public   : editing?.is_public ?? false,
    };

    try {
      setSaving(true);
      await saveTemplate(tpl);          // ⬅️  only call we need
      onClose();                        // go back to Library
    } finally {
      setSaving(false);
    }
  }

  /* simple styles */
  const label = { display: "block", marginTop: 12 };
  const input = { width: 400, padding: "6px 8px" };

  return (
    <div style={{ padding: 24 }}>
      <h2>{editing ? "Edit Template" : "New Template"}</h2>

      <label style={label}>Title*</label>
      <input
        style={input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label style={label}>Prompt*</label>
      <textarea
        style={{ ...input, height: 80 }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <label style={label}>Instructions</label>
      <textarea
        style={{ ...input, height: 60 }}
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
      />

      <label style={label}>Tags (comma-separated)</label>
      <input
        style={input}
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <label style={label}>Price (¢)</label>
      <input
        type="number"
        style={{ ...input, width: 120 }}
        value={priceCents}
        onChange={(e) => setPriceCents(Number(e.target.value))}
      />

      <div style={{ marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>{" "}
        <button onClick={onClose} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}
