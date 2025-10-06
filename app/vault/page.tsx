'use client';
import { useEffect, useMemo, useState } from "react";
import PasswordGenerator from "@/components/PasswordGenerator";
import { API } from "@/lib/api";
import { deriveKey, encryptItem, decryptItem, VaultItem } from "@/lib/crypto";

type ServerItem = { _id: string; ivB64: string; ciphertextB64: string; createdAt: string; updatedAt: string };

export default function VaultPage() {
  const [token, setToken] = useState<string | null>(null);
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [items, setItems] = useState<Array<{ id: string; data: VaultItem }>>([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState<VaultItem>({ title: "", username: "", password: "", url: "", notes: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("sessionToken");
    setToken(t);
    const email = sessionStorage.getItem("loginEmail");
    const password = sessionStorage.getItem("loginPassword");
    const keySaltB64 = sessionStorage.getItem("keySaltB64");
    if (password && keySaltB64) {
      deriveKey(password, keySaltB64).then(setKey);
    } else {
      setMsg("Missing key material. Please log in again.");
    }
  }, []);

  async function refresh() {
    if (!token || !key) return;
    const list: ServerItem[] = await API.list(token);
    const out: Array<{ id: string; data: VaultItem }> = [];
    for (const it of list) {
      try {
        const data = await decryptItem<VaultItem>(key, it.ivB64, it.ciphertextB64);
        out.push({ id: it._id, data });
      } catch (e) {
        console.error("decrypt failed", e);
      }
    }
    setItems(out);
  }

  useEffect(() => { refresh(); }, [token, key]);

  function onUse(pwd: string) {
    setForm(prev => ({ ...prev, password: pwd }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !key) return;
    const { ivB64, ciphertextB64 } = await encryptItem(key, form);
    if (editingId) {
      await API.update(token, editingId, { ivB64, ciphertextB64, version: 1 });
      setEditingId(null);
    } else {
      await API.create(token, { ivB64, ciphertextB64, version: 1 });
    }
    setForm({ title: "", username: "", password: "", url: "", notes: "" });
    await refresh();
  }

  function matches(v: VaultItem, q: string) {
    const hay = [v.title, v.username, v.url || "", v.notes || ""].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  const visible = useMemo(() => items.filter(it => matches(it.data, filter)), [items, filter]);

  async function onEdit(id: string) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setForm(item.data);
    setEditingId(id);
  }

  async function onDelete(id: string) {
    if (!token) return;
    if (!confirm("Delete this entry?")) return;
    await API.del(token, id);
    await refresh();
  }

  return (
    <main className="grid gap-6">
      <PasswordGenerator onUse={onUse} />
      <section className="card grid gap-3">
        <h2 className="text-lg font-semibold">{editingId ? "Edit entry" : "Add entry"}</h2>
        <form onSubmit={onSubmit} className="grid gap-2">
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <div className="grid md:grid-cols-2 gap-2">
            <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            <input placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <input placeholder="URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn" type="submit">{editingId ? "Save changes" : "Add to vault"}</button>
            {editingId && <button className="btn-ghost" type="button" onClick={() => { setEditingId(null); setForm({ title: "", username: "", password: "", url: "", notes: "" }); }}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="grid gap-2">
        <div className="flex items-center gap-2">
          <input placeholder="Search" value={filter} onChange={e=>setFilter(e.target.value)} className="w-full" />
          <button className="btn" onClick={refresh}>Refresh</button>
        </div>
        <ul className="grid gap-2">
          {visible.map(it => (
            <li key={it.id} className="card grid gap-1">
              <div className="font-medium">{it.data.title}</div>
              <div className="text-sm">User: {it.data.username}</div>
              {it.data.url && <div className="text-sm"><a href={it.data.url} className="link" target="_blank">Open link</a></div>}
              {it.data.notes && <div className="text-sm">{it.data.notes}</div>}
              <div className="flex gap-2 mt-2">
                <button className="btn" onClick={() => navigator.clipboard.writeText(it.data.password).then(()=>setTimeout(()=>navigator.clipboard.writeText(""), 15000))}>Copy password</button>
                <button className="btn-ghost" onClick={() => onEdit(it.id)}>Edit</button>
                <button className="btn-ghost" onClick={() => onDelete(it.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      {msg && <small className="muted">{msg}</small>}
    </main>
  );
}
