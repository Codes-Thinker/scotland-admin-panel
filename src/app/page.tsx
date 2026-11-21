"use client";

import Link from "next/link";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/ui";
import { useAdminStore } from "@/lib/store";

export default function DashboardPage() {
  const { users, drivers, rides, payments, dispatchQueue, activities } = useAdminStore();

  const passengers = users.filter((u) => u.role === "Passenger");
  const driverUsers = users.filter((u) => u.role === "Driver");
  const completed = rides.filter((r) => r.status === "Completed");
  const incomplete = rides.filter((r) => !["Completed", "Cancelled"].includes(r.status));
  const cancelled = rides.filter((r) => r.status === "Cancelled");
  const revenue = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pendingPay = payments.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const online = drivers.filter((d) => d.status === "Online" || d.status === "On trip").length;

  const cards = [
    { label: "Users", value: users.length, hint: `${passengers.length} passengers · ${driverUsers.length} drivers`, href: "/users", tone: "bg-[#F4F9D8]" },
    { label: "Passengers", value: passengers.length, hint: `${passengers.filter((p) => p.status === "Active").length} active`, href: "/passengers", tone: "bg-white" },
    { label: "Drivers", value: drivers.length, hint: `${online} online / on trip`, href: "/drivers", tone: "bg-white" },
    { label: "Rides total", value: rides.length, hint: `${completed.length} complete · ${incomplete.length} open`, href: "/rides", tone: "bg-white" },
    { label: "Completed", value: completed.length, hint: "Finished successfully", href: "/rides", tone: "bg-emerald-50" },
    { label: "Incomplete", value: incomplete.length, hint: "Queued / active / dispatched", href: "/dispatch", tone: "bg-amber-50" },
    { label: "Cancelled", value: cancelled.length, hint: "Dropped rides", href: "/rides", tone: "bg-rose-50" },
    { label: "Dispatch queue", value: dispatchQueue.length, hint: "Waiting assignment", href: "/dispatch", tone: "bg-blue-50" },
    { label: "Revenue paid", value: `£${revenue.toFixed(2)}`, hint: `Pending £${pendingPay.toFixed(2)}`, href: "/payments", tone: "bg-white" },
    { label: "Reports", value: "Ready", hint: "Export analytics", href: "/reports", tone: "bg-[#F4F9D8]" },
  ];

  return (
    <Shell title="Overview dashboard" subtitle="Fully interactive operations console — matches mobile app colors.">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold">Operations hub</p>
          <p className="text-sm text-slate-500">Tap any card to open that module. Actions update live across pages.</p>
        </div>
        <Link href="/dispatch" className="btn-lime">
          Open dispatch
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`card p-4 transition hover:border-[#8FBF1F] ${c.tone}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 text-2xl font-extrabold">{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold">Open rides (incomplete)</h2>
            <Link href="/rides" className="text-sm font-semibold text-[#2563EB]">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {incomplete.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <div>
                  <p className="font-semibold">
                    {r.id} · {r.passenger} → {r.driver || "Unassigned"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.pickup} → {r.destination} · {r.type} · {r.distance}
                  </p>
                </div>
                <StatusBadge value={r.status} />
              </div>
            ))}
            {incomplete.length === 0 ? <p className="text-sm text-slate-500">No open rides.</p> : null}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-extrabold">Live activity</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            {activities.map((a) => (
              <li key={a} className="rounded-lg bg-[#F4F9D8]/70 px-3 py-2">
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 font-extrabold">Driver readiness</h2>
          <div className="space-y-2">
            {drivers.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-slate-500">
                    {d.zone} · {d.vehicle} · ★ {d.rating}
                  </p>
                </div>
                <StatusBadge value={d.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold">Dispatch waiting</h2>
            <Link href="/dispatch" className="text-sm font-semibold text-[#8FBF1F]">
              Manage
            </Link>
          </div>
          <div className="space-y-2">
            {dispatchQueue.map((j) => (
              <div key={j.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-semibold">{j.passenger}</p>
                  <StatusBadge value={j.priority} />
                </div>
                <p className="text-xs text-slate-500">
                  {j.pickup} → {j.destination} · wait {j.waitingSec}s · suggest {j.suggestedDriver}
                </p>
              </div>
            ))}
            {dispatchQueue.length === 0 ? <p className="text-sm text-slate-500">Queue clear.</p> : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}
