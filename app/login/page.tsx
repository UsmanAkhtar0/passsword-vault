'use client';
import { useState } from "react";
import { API } from "@/lib/api";
import { deriveKey } from "@/lib/crypto";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { token, keySaltB64 } = await API.login(email, password);
      localStorage.setItem("sessionToken", token);
      // derive once and store a volatile key in memory by stashing password in sessionStorage temporarily
      sessionStorage.setItem("loginEmail", email);
      sessionStorage.setItem("loginPassword", password); // for demo only; in real app prefer a proper unlock flow
      sessionStorage.setItem("keySaltB64", keySaltB64);
      setMsg("Logged in");
      router.push("/vault");
    } catch (e: any) {
      setMsg(e.message || "Login failed");
    }
  }

  return (
    <main className="grid gap-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="grid gap-3 card">
        <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn" type="submit">Login</button>
        {msg && <small className="muted">{msg}</small>}
      </form>
    </main>
  )
}
