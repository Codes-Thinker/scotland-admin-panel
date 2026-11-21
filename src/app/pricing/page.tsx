"use client";

import { useState } from "react";
import { pricing as seed } from "@/lib/mock-data";
import { Shell } from "@/components/Shell";

export default function PricingPage() {
  const [rows, setRows] = useState(seed.map((p) => ({ ...p })));
  const [saved, setSaved] = useState(false);

  return (
    <Shell title="Pricing" subtitle="Edit fare rules (saved locally in this session).">
      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Ride type</th>
              <th className="px-4 py-3">Base (£)</th>
              <th className="px-4 py-3">Per mile (£)</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.type} className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold">{p.type}</td>
                <td className="px-4 py-3">
                  <input
                    className="input max-w-[120px]"
                    type="number"
                    step="0.01"
                    value={p.base}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], base: Number(e.target.value) };
                      setRows(next);
                      setSaved(false);
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    className="input max-w-[120px]"
                    type="number"
                    step="0.01"
                    value={p.perMile}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], perMile: Number(e.target.value) };
                      setRows(next);
                      setSaved(false);
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    className="input"
                    value={p.notes}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], notes: e.target.value };
                      setRows(next);
                      setSaved(false);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          className="btn-lime"
          onClick={() => {
            setSaved(true);
          }}
        >
          Save pricing
        </button>
        {saved ? <span className="text-sm font-semibold text-[#8FBF1F]">Saved for this session</span> : null}
      </div>
    </Shell>
  );
}
