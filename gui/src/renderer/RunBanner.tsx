/* ───────────────────────── renderer/RunBanner.tsx
   Displays “Running…” bar with Stop button
──────────────────────────────────────────────────────── */
import React from "react";

interface Props {
  running: boolean;
  onStop : () => void;
}

export default function RunBanner({ running, onStop }: Props) {
  if (!running) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#222",
        color: "#fff",
        padding: "8px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <span>🚀 Running automation…</span>
      <button onClick={onStop} style={{ padding: "4px 12px" }}>
        Stop
      </button>
    </div>
  );
}
