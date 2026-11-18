"use client";

import { useState } from "react";

export default function BuyButton({ listingId, disabled }: { listingId: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function checkout() {
    setMessage(""); setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity: 1 }),
      });
      const result = await response.json();
      if (response.status === 401) { window.location.assign("/login"); return; }
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Checkout unavailable.");
      window.location.assign(result.checkoutUrl);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unexpected error."); setLoading(false); }
  }
  return <div><button className="button primary" type="button" disabled={disabled || loading} onClick={checkout}>
    {disabled ? "Out of stock" : loading ? "Preparing checkout…" : "Buy securely"}
  </button>{message && <p role="alert" className="error-text">{message}</p>}</div>;
}
