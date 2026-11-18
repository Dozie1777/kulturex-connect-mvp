"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const values = new FormData(event.currentTarget);
    const body = {
      ...(mode === "register" ? { name: String(values.get("name") || "") } : {}),
      email: String(values.get("email") || ""), password: String(values.get("password") || ""),
    };
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to continue.");
      window.location.assign("/dashboard");
    } catch (error) { setError(error instanceof Error ? error.message : "Unexpected error."); }
    finally { setLoading(false); }
  }
  return <form className="card form-stack" onSubmit={submit}>
    {mode === "register" && <label>Full name<input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label>}
    <label>Email<input type="email" name="email" required autoComplete="email"/></label>
    <label>Password<input name="password" type="password" required minLength={mode === "register" ? 12 : 1}
      autoComplete={mode === "login" ? "current-password" : "new-password"}/></label>
    {error && <p role="alert" className="error-text">{error}</p>}
    <button type="submit" className="button primary" disabled={loading}>{loading ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</button>
    {mode === "login" ? <p>New here? <Link href="/register">Create an account</Link></p> : <p>Already registered? <Link href="/login">Sign in</Link></p>}
  </form>;
}
