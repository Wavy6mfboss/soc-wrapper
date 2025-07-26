import React from "react";

export default function PaywallModal({ onCheckout }: { onCheckout: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 12,
          width: 360,
          boxShadow: "0 4px 18px rgba(0,0,0,.25)"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Upgrade for Unlimited Runs</h2>
        <p>Free runs are exhausted. Unlock unlimited use for <b>$2.99</b>.</p>

        <button
          onClick={onCheckout}
          style={{
            marginTop: 12,
            padding: "8px 16px",
            width: "100%",
            background: "#635bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16
          }}
        >
          Pay with Stripe
        </button>
      </div>
    </div>
  );
}
