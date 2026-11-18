"use client";

export default function LogoutButton() {
  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (response.ok) window.location.assign("/login");
  }
  return <button className="button" type="button" onClick={logout}>Sign out</button>;
}
