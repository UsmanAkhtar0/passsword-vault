'use client';

import { useState } from "react";
import { generatePassword, GenOptions } from "@/lib/crypto";

export default function PasswordGenerator({ onUse }: { onUse?: (pwd: string) => void }) {
  const [opts, setOpts] = useState<GenOptions>({
    length: 16, useUpper: true, useLower: true, useNumbers: true, useSymbols: true, excludeLookalikes: true
  });
  const [pwd, setPwd] = useState("");

  function regen() {
    setPwd(generatePassword(opts));
  }

  function update<K extends keyof GenOptions>(k: K, v: GenOptions[K]) {
    setOpts(prev => ({ ...prev, [k]: v }));
  }

  return (
    <div className="card grid gap-3">
      <div className="flex items-center gap-2">
        <input value={pwd} readOnly className="w-full" />
        <button className="btn" onClick={() => { navigator.clipboard.writeText(pwd); setTimeout(() => navigator.clipboard.writeText(""), 15000); }}>Copy (15s clear)</button>
        <button className="btn" onClick={() => onUse?.(pwd)}>Use</button>
        <button className="btn" onClick={regen}>Generate</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-center">
        <label>Length: {opts.length}</label>
        <input type="range" min={8} max={64} value={opts.length} onChange={e => update("length", Number(e.target.value))} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={opts.useUpper} onChange={e => update("useUpper", e.target.checked)} /> Uppercase</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={opts.useLower} onChange={e => update("useLower", e.target.checked)} /> Lowercase</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={opts.useNumbers} onChange={e => update("useNumbers", e.target.checked)} /> Numbers</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={opts.useSymbols} onChange={e => update("useSymbols", e.target.checked)} /> Symbols</label>
        <label className="flex items-center gap-2 col-span-2"><input type="checkbox" checked={opts.excludeLookalikes} onChange={e => update("excludeLookalikes", e.target.checked)} /> Exclude look-alikes (0/O, 1/l/I)</label>
      </div>
    </div>
  );
}
