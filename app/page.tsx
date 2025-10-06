export default function Home() {
  return (
    <main className="grid gap-6">
      <section className="card">
        <h1 className="text-2xl font-semibold mb-2">Password Generator + Secure Vault (MVP)</h1>
        <p>Generate strong passwords and store them in a client-side encrypted vault. The server only ever sees encrypted blobs.</p>
      </section>
      <section className="card">
        <ul className="list-disc ml-6">
          <li>Password generator with length and character options</li>
          <li>Simple email+password auth</li>
          <li>Client-side encryption using Web Crypto (AES-GCM + PBKDF2)</li>
          <li>Copy-to-clipboard with auto-clear</li>
          <li>Basic search on decrypted items</li>
        </ul>
      </section>
    </main>
  )
}
