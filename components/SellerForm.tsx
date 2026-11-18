"use client";

import { FormEvent, useState } from "react";

export default function SellerForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/sellers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: String(form.get("name") || ""), country: String(form.get("country") || ""), category: String(form.get("category") || ""),
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save seller profile.");
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unexpected error."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="card form-stack">
    <label>Business name<input name="name" required minLength={2} maxLength={120}/></label>
    <label>Country<input name="country" required minLength={2} maxLength={100}/></label>
    <label>Product category<input name="category" required minLength={2} maxLength={80}/></label>
    <p className="muted">All sellers require verification before their approved products can be sold.</p>
    {message && <p role="alert" className="error-text">{message}</p>}
    <button type="submit" className="button primary" disabled={loading}>{loading ? "Submitting…" : "Apply as a seller"}</button>
  </form>;
}
