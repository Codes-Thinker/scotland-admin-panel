"use client";

import { useState } from "react";
import { Shell } from "@/components/Shell";
import { formatPounds, useApi } from "@/lib/use-api";

interface Summary {
  range: { from: string; to: string };
  rides: { total: number; completed: number; cancelled: number; open: number; cancellationRate: number; averageWaitSeconds: number | null };
  revenue: { completedFarePence: number; paidPence: number; pendingPence: number; refundedPence: number };
  payments: Record<"pending" | "paid" | "failed" | "refunded", number>;
  drivers: { approved: number; online: number; pendingApproval: number; averageRating: number | null };
  daily: { day: string; rides: number; completed: number; revenuePence: number }[];
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const today = new Date();
  const [from, setFrom] = useState(isoDay(new Date(today.getTime() - 29 * 86_400_000)));
  const [to, setTo] = useState(isoDay(today));

  const days = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
  const rangeError =
    from > to
      ? "The start date must be on or before the end date."
      : days > 365
        ? "The range can be at most one year."
        : null;
  const report = useApi<Summary>(
    rangeError ? null : `/admin/reports/summary?from=${from}&to=${to}`,
  );
  const s = report.data;

  function exportCsv() {
    if (!s) return;
    const lines = [
      "section,metric,value",
      `range,from,${s.range.from}`,
      `range,to,${s.range.to}`,
      `rides,total,${s.rides.total}`,
      `rides,completed,${s.rides.completed}`,
      `rides,cancelled,${s.rides.cancelled}`,
      `rides,open,${s.rides.open}`,
      `rides,cancellation_rate,${s.rides.cancellationRate}`,
      `rides,average_wait_seconds,${s.rides.averageWaitSeconds ?? ""}`,
      `revenue,completed_fares_pence,${s.revenue.completedFarePence}`,
      `revenue,paid_pence,${s.revenue.paidPence}`,
      `revenue,pending_pence,${s.revenue.pendingPence}`,
      `revenue,refunded_pence,${s.revenue.refundedPence}`,
      `drivers,approved,${s.drivers.approved}`,
      `drivers,online,${s.drivers.online}`,
      `drivers,pending_approval,${s.drivers.pendingApproval}`,
      `drivers,average_rating,${s.drivers.averageRating ?? ""}`,
      ...s.daily.map((d) => `daily,${d.day},rides=${d.rides} completed=${d.completed} revenue_pence=${d.revenuePence}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fife-nearby-taxis-${s.range.from}-to-${s.range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell title="Reports" subtitle="Rides, revenue and drivers for a date range" status={s ? `${s.range.from} to ${s.range.to}` : "Loading…"}>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold">
          From
          <input className="input mt-1 block" type="date" value={from} max={to} onChange={(e) => { setFrom(e.target.value); }} />
        </label>
        <label className="text-sm font-semibold">
          To
          <input className="input mt-1 block" type="date" value={to} min={from} onChange={(e) => { setTo(e.target.value); }} />
        </label>
        <button className="btn-lime" disabled={!s} onClick={exportCsv}>
          Export CSV
        </button>
      </div>
      {rangeError || report.error ? <p className="mb-4 text-sm font-semibold text-rose-600">{rangeError || report.error}</p> : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Rides</p>
          <p className="text-3xl font-extrabold">{s?.rides.total ?? "—"}</p>
          <p className="text-xs text-slate-500">{s?.rides.open ?? 0} still open</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="text-3xl font-extrabold text-emerald-600">{s?.rides.completed ?? "—"}</p>
          <p className="text-xs text-slate-500">{Math.round((s?.rides.cancellationRate ?? 0) * 100)}% cancelled</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Completed fares</p>
          <p className="text-3xl font-extrabold">{formatPounds(s?.revenue.completedFarePence)}</p>
          <p className="text-xs text-slate-500">Paid {formatPounds(s?.revenue.paidPence)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Average wait to a driver</p>
          <p className="text-3xl font-extrabold">
            {s?.rides.averageWaitSeconds === null || s?.rides.averageWaitSeconds === undefined ? "—" : `${Math.round(s.rides.averageWaitSeconds / 60)} min`}
          </p>
          <p className="text-xs text-slate-500">Driver rating {s?.drivers.averageRating?.toFixed(2) ?? "—"}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 font-extrabold">Payments</h2>
          <div className="space-y-2 text-sm">
            {(["paid", "pending", "failed", "refunded"] as const).map((k) => (
              <div key={k} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="capitalize">{k}</span>
                <span className="font-semibold">{s?.payments[k] ?? "—"}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <p>Drivers approved: <strong>{s?.drivers.approved ?? "—"}</strong></p>
            <p>Drivers online now: <strong>{s?.drivers.online ?? "—"}</strong></p>
            <p>Awaiting approval: <strong>{s?.drivers.pendingApproval ?? "—"}</strong></p>
          </div>
        </div>

        <div className="card overflow-x-auto p-4">
          <h2 className="mb-3 font-extrabold">Day by day</h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2">Day</th>
                <th className="py-2">Rides</th>
                <th className="py-2">Completed</th>
                <th className="py-2">Fares</th>
              </tr>
            </thead>
            <tbody>
              {(s?.daily ?? []).map((d) => (
                <tr key={d.day} className="border-b border-slate-100">
                  <td className="py-2">{d.day}</td>
                  <td className="py-2">{d.rides}</td>
                  <td className="py-2">{d.completed}</td>
                  <td className="py-2">{formatPounds(d.revenuePence)}</td>
                </tr>
              ))}
              {s && s.daily.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={4}>No rides in this range.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
