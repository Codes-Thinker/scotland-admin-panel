"use client";

import { useState } from "react";
import { Shell } from "@/components/Shell";

export default function SettingsPage() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [docs, setDocs] = useState(true);
  const [pool, setPool] = useState(60);
  const [saved, setSaved] = useState(false);

  return (
    <Shell title="Settings" subtitle="Platform toggles — functional in-session.">
      <div className="card max-w-xl space-y-4 p-5">
        <label className="flex items-center justify-between text-sm font-medium">
          <span>Email notifications</span>
          <input type="checkbox" checked={email} onChange={(e) => { setEmail(e.target.checked); setSaved(false); }} className="h-4 w-4" />
        </label>
        <label className="flex items-center justify-between text-sm font-medium">
          <span>Push alerts for SOS</span>
          <input type="checkbox" checked={push} onChange={(e) => { setPush(e.target.checked); setSaved(false); }} className="h-4 w-4" />
        </label>
        <label className="flex items-center justify-between text-sm font-medium">
          <span>Require driver document verification</span>
          <input type="checkbox" checked={docs} onChange={(e) => { setDocs(e.target.checked); setSaved(false); }} className="h-4 w-4" />
        </label>
        <label className="block text-sm font-medium">
          Pool dispatch timeout (seconds)
          <input
            className="input mt-2"
            type="number"
            value={pool}
            onChange={(e) => { setPool(Number(e.target.value)); setSaved(false); }}
          />
        </label>
        <button className="btn-blue" onClick={() => setSaved(true)}>
          Save settings
        </button>
        {saved ? <p className="text-sm font-semibold text-[#8FBF1F]">Settings saved for this session.</p> : null}
      </div>
    </Shell>
  );
}
