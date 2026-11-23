"use client";

import { useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { runAction, useApi } from "@/lib/use-api";

interface RuleRow {
  id: string;
  rideType: "standard" | "emergency" | "roadside";
  baseFarePence: number;
  perMilePence: number;
  minimumFarePence: number;
  laterBookingSurchargeBp: number;
  notes: string | null;
  effectiveFrom: string;
}

/** Editable form values, in pounds (and per cent for the later-booking surcharge). */
interface FormRow {
  rideType: RuleRow["rideType"];
  base: string;
  perMile: string;
  minimum: string;
  surchargePercent: string;
  notes: string;
}

const LABEL: Record<RuleRow["rideType"], string> = {
  standard: "Standard",
  emergency: "Emergency",
  roadside: "Roadside",
};

const ORDER: RuleRow["rideType"][] = ["standard", "emergency", "roadside"];

function toForm(r: RuleRow): FormRow {
  return {
    rideType: r.rideType,
    base: (r.baseFarePence / 100).toFixed(2),
    perMile: (r.perMilePence / 100).toFixed(2),
    minimum: (r.minimumFarePence / 100).toFixed(2),
    surchargePercent: (r.laterBookingSurchargeBp / 100).toString(),
    notes: r.notes ?? "",
  };
}

/** Converts the form to API pence and basis points, or returns a message for the first problem. */
function toPayload(rows: FormRow[]): { rules: object[] } | string {
  const rules: object[] = [];
  for (const row of rows) {
    const money = { base: row.base, perMile: row.perMile, minimum: row.minimum };
    for (const [name, value] of Object.entries(money)) {
      const n = Number(value);
      if (value.trim() === "" || !Number.isFinite(n) || n < 0) {
        return `${LABEL[row.rideType]}: ${name === "perMile" ? "per mile" : name} must be zero or more.`;
      }
    }
    const pct = Number(row.surchargePercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 50) {
      return `${LABEL[row.rideType]}: later-booking surcharge must be between 0 and 50 per cent.`;
    }
    rules.push({
      rideType: row.rideType,
      baseFarePence: Math.round(Number(row.base) * 100),
      perMilePence: Math.round(Number(row.perMile) * 100),
      minimumFarePence: Math.round(Number(row.minimum) * 100),
      laterBookingSurchargeBp: Math.round(pct * 100),
      notes: row.notes.trim() || undefined,
    });
  }
  return { rules };
}

export default function PricingPage() {
  const rules = useApi<RuleRow[]>("/admin/pricing");
  // Rows as the server has them, and the operator's unsaved edits (null when there are none).
  const saved = useMemo<FormRow[]>(() => {
    if (!rules.data) return [];
    return [...rules.data].sort((a, b) => ORDER.indexOf(a.rideType) - ORDER.indexOf(b.rideType)).map(toForm);
  }, [rules.data]);
  const [edits, setEdits] = useState<FormRow[] | null>(null);
  const rows = edits ?? saved;
  const dirty = edits !== null;
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  function update(index: number, patch: Partial<FormRow>) {
    setEdits((prev) => (prev ?? saved).map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setNotice(null);
  }

  async function save() {
    const payload = toPayload(rows);
    if (typeof payload === "string") {
      setNotice({ tone: "error", text: payload });
      return;
    }
    setSaving(true);
    const error = await runAction(() => api("/admin/pricing", { method: "PUT", body: payload }));
    setSaving(false);
    if (error) {
      setNotice({ tone: "error", text: error });
      return;
    }
    setEdits(null);
    setNotice({ tone: "ok", text: "Saved. New rides are priced with these rules; past fares are unchanged." });
    rules.reload();
  }

  return (
    <Shell title="Pricing" subtitle="Fare rules for each ride type" status="Live data from the operations API">
      {rules.error ? <p className="mb-4 text-sm font-semibold text-rose-600">{rules.error}</p> : null}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Ride type</th>
              <th className="px-4 py-3">Base (£)</th>
              <th className="px-4 py-3">Per mile (£)</th>
              <th className="px-4 py-3">Minimum (£)</th>
              <th className="px-4 py-3">Later booking (%)</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.rideType} className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold">{LABEL[r.rideType]}</td>
                <td className="px-4 py-3">
                  <input className="input max-w-[120px]" type="number" min="0" step="0.01" value={r.base} onChange={(e) => update(i, { base: e.target.value })} />
                </td>
                <td className="px-4 py-3">
                  <input className="input max-w-[120px]" type="number" min="0" step="0.01" value={r.perMile} onChange={(e) => update(i, { perMile: e.target.value })} />
                </td>
                <td className="px-4 py-3">
                  <input className="input max-w-[120px]" type="number" min="0" step="0.01" value={r.minimum} onChange={(e) => update(i, { minimum: e.target.value })} />
                </td>
                <td className="px-4 py-3">
                  <input className="input max-w-[120px]" type="number" min="0" max="50" step="0.5" value={r.surchargePercent} onChange={(e) => update(i, { surchargePercent: e.target.value })} />
                </td>
                <td className="px-4 py-3">
                  <input className="input" value={r.notes} onChange={(e) => update(i, { notes: e.target.value })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="btn-lime" disabled={!dirty || saving || rows.length === 0} onClick={save}>
          {saving ? "Saving…" : "Save pricing"}
        </button>
        {notice ? (
          <span className={`text-sm font-semibold ${notice.tone === "ok" ? "text-[#5f8a12]" : "text-rose-600"}`}>{notice.text}</span>
        ) : null}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Every save keeps the previous rules in history. Scheduled rides are priced as Standard plus the later-booking surcharge.
      </p>
    </Shell>
  );
}
