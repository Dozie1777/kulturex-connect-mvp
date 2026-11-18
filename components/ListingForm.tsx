"use client";

import { FormEvent, useState } from "react";
import { poundsToPence } from "@/lib/commerce";

export default function ListingForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setSuccess(false); setLoading(true);
    const target = event.currentTarget;
    const form = new FormData(target);
    try {
      const priceMinor = poundsToPence(String(form.get("price") || ""));
      const response = await fetch("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        title: String(form.get("title") || ""), description: String(form.get("description") || ""),
        origin: String(form.get("origin") || ""), category: String(form.get("category") || ""),
        stock: Number(form.get("stock")), priceMinor,
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save listing.");
      setMessage("Listing submitted for administrator review."); setSuccess(true);
      target.reset();
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unexpected error."); }
    finally { setLoading(false); }
  }
  return <form className="card form-stack" onSubmit={submit}>
    <label>Product name<input name="title" required minLength={3} maxLength={160}/></label>
    <label>Description<textarea name="description" required minLength={10} maxLength={3000}/></label>
    <label>Country of origin<input name="origin" required minLength={2} maxLength={100}/></label>
    <label>Category<input name="category" required minLength={2} maxLength={80}/></label>
    <label>Price in GBP<input type="text" name="price" inputMode="decimal" placeholder="12.50" required/></label>
    <label>Available units<input type="number" name="stock" min={0} max={100000} step={1} required/></label>
    {message && <p role="status" className={success ? "success-text" : "error-text"}>{message}</p>}
    <button type="submit" className="button primary" disabled={loading}>{loading ? "Submitting…" : "Submit for review"}</button>
  </form>;
}
