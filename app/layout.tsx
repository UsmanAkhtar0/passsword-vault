import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Password Generator + Secure Vault (MVP)",
  description: "Client-side encrypted vault with simple auth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-4xl mx-auto p-4">
          <header className="flex items-center justify-between mb-6">
            <Link href="/" className="text-xl font-bold">🔐 Vault</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/vault" className="link">Vault</Link>
              <Link href="/login" className="link">Login</Link>
              <Link href="/signup" className="link">Sign up</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
