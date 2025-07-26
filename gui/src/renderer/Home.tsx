import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import RunButton    from "./components/RunButton";
import PaywallModal from "./components/PaywallModal";
import SettingsMenu from "./components/SettingsMenu";

const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE!);

export default function Home() {
  const [prompt,   setPrompt]   = useState("");
  const [freeRuns, setFreeRuns] = useState(0);
  const [isPaid,   setIsPaid]   = useState(false);
  const [paywall,  setPaywall]  = useState(false);

  /* load config */
  useEffect(() => {
    (async () => {
      const cfg = await window.electron.getConfig();
      setFreeRuns(cfg.freeRuns);
      setIsPaid(cfg.isPaid);
    })();
  }, []);

  /* Stripe redirect */
  useEffect(() => {
    const handler = () => setIsPaid(true);
    window.electron.ipcRenderer.on("paid", handler);
    return () => window.electron.ipcRenderer.off("paid", handler);
  }, []);

  /* helpers */
  const handleRunsLeft = (n: number) => setFreeRuns(n);
  const handleExceeded = () => setPaywall(true);

  /* checkout */
  const onCheckout = async () => {
    const r = await fetch("http://localhost:4242/create-checkout-session", { method: "POST" });
    const { sessionId, url } = await r.json();
    const stripeJs = await stripe;
    if (stripeJs && sessionId) return stripeJs.redirectToCheckout({ sessionId });
    if (url) window.open(url, "_blank");
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Type your CLI prompt…"
        style={{ width: 260, marginRight: 8, padding: "6px 8px" }}
      />

      <RunButton
        isPaid={isPaid}
        freeRuns={freeRuns}
        paywallOpen={paywall}
        prompt={prompt}
        onRunsLeft={handleRunsLeft}
        onExceeded={handleExceeded}
      />

      {!isPaid && (
        <span style={{ marginLeft: 12 }}>
          Free runs left: {freeRuns}
        </span>
      )}

      <SettingsMenu onReset={runs => { setIsPaid(false); setFreeRuns(runs); }} />

      {paywall && <PaywallModal onCheckout={onCheckout} />}
    </div>
  );
}
