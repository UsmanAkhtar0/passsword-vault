'use client';
import { useState } from "react";
import { API } from "@/lib/api";

function b64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    try {
      await API.signup(email, password, b64(salt));
      setOk("Account created. You can now log in.");
    } catch (err: any) {
      setOk(err.message || "Signup failed");
    }
  }

  return (
    <main className="grid gap-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="grid gap-3 card">
        <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn" type="submit">Sign up</button>
        {ok && <small className="muted">{ok}</small>}
      </form>
    </main>
  )
}
