/* ───────────────────────── renderer/Home.tsx
   Simple landing page – no direct ipcRenderer pokes
────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react'

interface Config {
  env:      string
  userData: string
}

export default function Home () {
  const [cfg, setCfg] = useState<Config | null>(null)
  const [savedTick, setSaved] = useState(0)

  /* ask main-process for some info & listen for template-saved */
  useEffect(() => {
    let off = () => {}
    ;(async () => {
      try {
        const c = await window.electron.getConfig()
        setCfg(c)
      } catch (e) {
        /* ignore – preload not ready in unit tests */
      }
      off = window.electron.onTemplateSaved(() => setSaved(x => x + 1))
    })()
    return () => off()
  }, [])

  return (
    <div>
      <h1>Welcome to SOC-Wrapper</h1>

      {cfg && (
        <p style={{ fontSize: 12, color: '#666' }}>
          mode: <b>{cfg.env}</b> • data dir: {cfg.userData}
        </p>
      )}

      {savedTick > 0 && (
        <p style={{ color: '#090' }}>
          ✔ Template saved ({savedTick})
        </p>
      )}

      <p>
        Use <em>Library</em> to create automations, or visit the{' '}
        <em>Marketplace</em> to download ready-made ones.
      </p>
    </div>
  )
}
