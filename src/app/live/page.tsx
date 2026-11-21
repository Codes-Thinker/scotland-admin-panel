"use client";

import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/ui";
import { useAdminStore } from "@/lib/store";

export default function LivePage() {
  const { drivers, rides } = useAdminStore();
  const active = rides.filter((r) => r.status === "Active" || r.status === "Dispatched");

  return (
    <Shell title="Live map" subtitle="Active rides + driver positions (map placeholder).">
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        {active.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="font-extrabold">
                {r.id} · {r.passenger}
              </p>
              <StatusBadge value={r.status} />
            </div>
            <p className="text-sm text-slate-600">
              Driver: {r.driver || "Unassigned"}
            </p>
            <p className="text-sm text-slate-500">
              {r.pickup} → {r.destination} · {r.distance}
            </p>
          </div>
        ))}
        {active.length === 0 ? <p className="text-slate-500">No active rides right now.</p> : null}
      </div>

      <div className="card relative overflow-hidden p-0">
        <div className="absolute right-3 top-3 z-10 rounded-lg bg-white/90 px-2 py-1 text-xs text-slate-500">
          Map preview · Google Maps key later
        </div>
        <div className="relative h-80 bg-gradient-to-br from-slate-100 to-slate-200">
          {drivers.map((d, i) => (
            <div
              key={d.id}
              className="absolute rounded-lg px-2 py-1 text-xs font-semibold text-white shadow"
              style={{
                left: `${12 + ((i * 17) % 70)}%`,
                top: `${18 + ((i * 23) % 60)}%`,
                background: d.status === "Online" ? "#8FBF1F" : d.status === "On trip" ? "#2563EB" : "#94a3b8",
              }}
            >
              {d.name.split(" ")[0]} · {d.status}
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
