/* ───────────────────────── renderer/App.tsx
   Root component – routing, global providers, CLI banner
─────────────────────────────────────────────────────────*/
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Home           from "./Home";
import Library        from "./Library";
import TemplateEditor from "./TemplateEditor";
import Marketplace    from "./Marketplace";           /* ★ new */
import { ErrorBoundary } from "./ErrorBoundary";
import { TemplateJSON }  from "../services/templates";

/* ---------------------------------------------------- query-client */
const queryClient = new QueryClient();

/* ---------------------------------------------------- page state */
type Page =
  | { view: "home" }
  | { view: "library" }
  | { view: "marketplace" }                         /* ★ new */
  | { view: "editor"; editing: TemplateJSON | null };

/* ---------------------------------------------------- UI */
export default function App() {
  const [page, setPage]       = useState<Page>({ view: "home" });
  const [running, setRunning] = useState(false);
  const [lastCmd, setLastCmd] = useState<string>("");

  /* subscribe to CLI lifecycle events sent from preload.js */
  useEffect(() => {
    /* started */
    const unsubStart = window.electron.onCliStarted((cmd?: string[]) => {
      setRunning(true);
      /* tolerate undefined | string[] */
      const text =
        Array.isArray(cmd) ? cmd.join(" ") : typeof cmd === "string" ? cmd : "";
      setLastCmd(text);
    });

    /* exited */
    const unsubExit = window.electron.onCliExited(() => setRunning(false));

    return () => {
      unsubStart();
      unsubExit();
    };
  }, []);

  /* helper passed to Library rows */
  const handleRun = async (tpl: TemplateJSON) => {
    await window.electron.runCli(["--prompt", tpl.prompt]);
  };

  /* -------------------------------------------------- render */
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {/* CLI running banner */}
        {running && (
          <div
            style={{
              background: "#ffeeaa",
              padding: "6px 12px",
              fontSize: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              🚀 Running&nbsp;
              {lastCmd ? <code>{lastCmd}</code> : <em>automation&nbsp;…</em>}
            </span>
            <button onClick={() => window.electron.stopCli()}>Stop</button>
          </div>
        )}

        <div style={{ padding: 16, fontFamily: "sans-serif" }}>
          {/* nav */}
          <nav style={{ marginBottom: 24 }}>
            <a
              onClick={() => setPage({ view: "home" })}
              style={{ marginRight: 16, cursor: "pointer" }}
            >
              Home
            </a>
            <a
              onClick={() => setPage({ view: "library" })}
              style={{ marginRight: 16, cursor: "pointer" }}
            >
              Library
            </a>
            <a
              onClick={() => setPage({ view: "marketplace" })}
              style={{ cursor: "pointer" }}
            >
              Marketplace
            </a>
          </nav>

          {/* routes */}
          {page.view === "home" && <Home />}

          {page.view === "library" && (
            <Library
              onRun={handleRun}
              onEdit={(tpl) => setPage({ view: "editor", editing: tpl })}
            />
          )}

          {page.view === "marketplace" && <Marketplace />}

          {page.view === "editor" && (
            <TemplateEditor
              editing={page.editing}
              onClose={() => setPage({ view: "library" })}
            />
          )}
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
