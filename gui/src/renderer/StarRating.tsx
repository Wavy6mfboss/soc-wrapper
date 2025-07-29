/* ───────────────────────── renderer/StarRating.tsx
   Interactive 1–5 star widget (controlled)
────────────────────────────────────────────────────────── */
import React from "react"

export default function StarRating ({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  const Star = ({ filled }: { filled: boolean }) => (
    <span
      style={{ cursor: "pointer", color: filled ? "#f6b73c" : "#ccc", fontSize: 20 }}
    >
      ★
    </span>
  )

  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} onClick={() => onChange(i + 1)}>
          <Star filled={i < value} />
        </span>
      ))}
    </div>
  )
}
