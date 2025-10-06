export type LoginResponse = { token: string; keySaltB64: string };
export const API = {
  async signup(email: string, password: string, keySaltB64: string) {
    const r = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, keySaltB64 })});
    if (!r.ok) throw new Error(await r.text());
    return true;
  },
  async login(email: string, password: string): Promise<LoginResponse> {
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })});
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async list(token: string) {
    const r = await fetch("/api/vault", { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async create(token: string, payload: any) {
    const r = await fetch("/api/vault", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)});
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async update(token: string, id: string, payload: any) {
    const r = await fetch(`/api/vault/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)});
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async del(token: string, id: string) {
    const r = await fetch(`/api/vault/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }});
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
};
