import React from "react";

export default function SettingsMenu({
  onReset,
}: {
  onReset: (freeRuns: number) => void;
}) {
  const [saving, setSaving] = React.useState(false);

  async function resetFreeMode() {
    setSaving(true);
    await window.electron.saveConfig?.({ isPaid: false, freeRuns: 3 });
    setSaving(false);
    onReset(3);                    // update parent state
  }

  return (
    <div style={{ marginTop: 32 }}>
      <button
        onClick={resetFreeMode}
        disabled={saving}
        style={{
          fontSize: 12,
          background: "none",
          border: "none",
          color: "#3366ee",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        {saving ? "(resetting…)" : "Reset Free-Mode"}
      </button>
    </div>
  );
}
