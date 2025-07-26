import React, { useState } from "react";

interface Props {
  isPaid: boolean;
  freeRuns: number;
  paywallOpen: boolean;
  prompt: string;
  onRunsLeft: (n: number) => void;
  onExceeded: () => void;
}

export default function RunButton({
  isPaid,
  freeRuns,
  paywallOpen,
  prompt,
  onRunsLeft,
  onExceeded,
}: Props) {
  const [busy, setBusy] = useState(false);

  const runCliOnce = async () => {
    setBusy(true);
    try {
      await window.electron.runCli?.(["--prompt", prompt]);
    } finally {
      setBusy(false);
    }
  };

  const handleClick = async () => {
    if (busy) return;

    /* paid users → always allowed */
    if (isPaid) return runCliOnce();

    /* free tier -------------------------------- */
    if (freeRuns > 0) {
      await runCliOnce();

      /* decrement after the run finishes */
      const res = await window.electron.decrementRun?.();
      onRunsLeft(res.freeRunsLeft);

      /* if that was the LAST run, show pay-wall for next click */
      if (res.freeRunsLeft === 0) onExceeded();
      return;
    }

    /* already at 0 → open pay-wall immediately */
    onExceeded();
  };

  const inactive = busy || paywallOpen;        // button enabled even at 0 runs

  return (
    <button
      onClick={handleClick}
      disabled={inactive}
      style={{
        padding: "8px 16px",
        background: inactive ? "#888" : "#222",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: inactive ? "not-allowed" : "pointer",
      }}
    >
      {busy ? "Running…" : "Run CLI"}
    </button>
  );
}
