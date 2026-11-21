"use client";

import { Shell } from "@/components/Shell";
import { useAdminStore } from "@/lib/store";

export default function ReportsPage() {
  const { users, drivers, rides, payments } = useAdminStore();

  const passengers = users.filter((u) => u.role === "Passenger").length;
  const completed = rides.filter((r) => r.status === "Completed");
  const incomplete = rides.filter((r) => !["Completed", "Cancelled"].includes(r.status));
  const cancelled = rides.filter((r) => r.status === "Cancelled");
  const revenue = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const byType = ["Standard", "Emergency", "Scheduled", "Roadside"].map((t) => ({
    type: t,
    count: rides.filter((r) => r.type === t).length,
  }));
  const topDrivers = [...drivers].sort((a, b) => b.earnings - a.earnings).slice(0, 5);

  function exportCsv() {
    const lines = [
      "section,metric,value",
      `users,total,${users.length}`,
      `users,passengers,${passengers}`,
      `drivers,total,${drivers.length}`,
      `rides,total,${rides.length}`,
      `rides,completed,${completed.length}`,
      `rides,incomplete,${incomplete.length}`,
      `rides,cancelled,${cancelled.length}`,
      `finance,paid_revenue,${revenue.toFixed(2)}`,
      ...byType.map((x) => `ride_type,${x.type},${x.count}`),
      ...topDrivers.map((d) => `top_driver,${d.name},${d.earnings.toFixed(2)}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fife-nearby-taxis-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell title="Reports" subtitle="Deep ops analytics + CSV export from live mock store.">
      <div className="mb-4 flex justify-end">
        <button className="btn-lime" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Users</p>
          <p className="text-3xl font-extrabold">{users.length}</p>
          <p className="text-xs text-slate-500">{passengers} passengers</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Drivers</p>
          <p className="text-3xl font-extrabold">{drivers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Completed rides</p>
          <p className="text-3xl font-extrabold text-emerald-600">{completed.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Incomplete rides</p>
          <p className="text-3xl font-extrabold text-[#2563EB]">{incomplete.length}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 font-extrabold">Rides by type</h2>
          <div className="space-y-3">
            {byType.map((x) => (
              <div key={x.type}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{x.type}</span>
                  <span className="font-semibold">{x.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#8FBF1F]"
                    style={{ width: `${Math.max(8, (x.count / Math.max(1, rides.length)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <h2 className="mb-3 font-extrabold">Top drivers by earnings</h2>
          <div className="space-y-2">
            {topDrivers.map((d, i) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl bg-[#F4F9D8]/70 px-3 py-2">
                <span className="font-semibold">
                  #{i + 1} {d.name}
                </span>
                <span className="font-extrabold">£{d.earnings.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <p>
              Cancelled: <strong>{cancelled.length}</strong>
            </p>
            <p>
              Paid revenue: <strong>£{revenue.toFixed(2)}</strong>
            </p>
            <p>
              Completion rate:{" "}
              <strong>
                {rides.length ? Math.round((completed.length / rides.length) * 100) : 0}%
              </strong>
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
