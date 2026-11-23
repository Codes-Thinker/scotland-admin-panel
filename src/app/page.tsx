"use client";

import Link from "next/link";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/ui";
import { type Paged } from "@/lib/api";
import { formatDate, formatPounds, useApi } from "@/lib/use-api";

interface Summary {
  range: { from: string; to: string };
  rides: { total: number; completed: number; cancelled: number; open: number; cancellationRate: number; averageWaitSeconds: number | null };
  revenue: { completedFarePence: number; paidPence: number; pendingPence: number };
  drivers: { approved: number; online: number; pendingApproval: number; averageRating: number | null };
}

interface ActivityRow {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  actorName: string | null;
}

interface QueueRow {
  id: string;
  passenger: { name: string };
  pickup: { address: string };
  drop: { address: string };
  priority: "normal" | "high" | "sos";
  waitingSeconds: number;
}

const ACTION_TEXT: Record<string, string> = {
  "user.status_changed": "changed an account status",
  "driver_document.reviewed": "reviewed a driver document",
  "driver_document.viewed": "opened a driver document",
  "ride.assigned": "assigned a driver to a ride",
  "ride.cancelled": "cancelled a ride",
  "payment.status_changed": "changed a payment status",
  "pricing.replaced": "updated pricing",
};

export default function OverviewPage() {
  const summary = useApi<Summary>("/admin/reports/summary", { pollMs: 15000 });
  const queue = useApi<QueueRow[]>("/admin/dispatch/queue", { pollMs: 15000 });
  const activity = useApi<ActivityRow[]>("/admin/activity?limit=8", { pollMs: 15000 });
  // The API filters by one status at a time, so fetch recent rides and keep the ones with a driver.
  const recent = useApi<Paged<{ id: string; status: string; passenger: { name: string }; driver: { name: string } | null; pickup: { address: string }; drop: { address: string } }>>(
    "/admin/rides?pageSize=100",
    { pollMs: 15000 },
  );
  const withDriver = (recent.data?.data ?? []).filter((r) => ["assigned", "arrived", "in_progress"].includes(r.status));
  const WITH_DRIVER_LABEL: Record<string, string> = { assigned: "Assigned", arrived: "Arrived", in_progress: "In progress" };

  const s = summary.data;
  const cards = [
    { label: "Rides (30 days)", value: s?.rides.total ?? "—", hint: `${s?.rides.completed ?? 0} completed · ${s?.rides.open ?? 0} open`, href: "/rides", tone: "bg-[#F4F9D8]" },
    { label: "Completed", value: s?.rides.completed ?? "—", hint: "Finished successfully", href: "/rides", tone: "bg-emerald-50" },
    { label: "Cancelled", value: s?.rides.cancelled ?? "—", hint: `${Math.round((s?.rides.cancellationRate ?? 0) * 100)}% of rides`, href: "/rides", tone: "bg-rose-50" },
    { label: "Waiting for a driver", value: queue.data?.length ?? "—", hint: "Dispatch queue", href: "/dispatch", tone: "bg-blue-50" },
    { label: "Paid (30 days)", value: formatPounds(s?.revenue.paidPence), hint: `Pending ${formatPounds(s?.revenue.pendingPence)}`, href: "/payments", tone: "bg-white" },
    { label: "Drivers online", value: s?.drivers.online ?? "—", hint: `${s?.drivers.approved ?? 0} approved drivers`, href: "/drivers", tone: "bg-white" },
    { label: "Awaiting approval", value: s?.drivers.pendingApproval ?? "—", hint: "Driver accounts to review", href: "/drivers", tone: "bg-amber-50" },
  ];

  return (
    <Shell title="Overview" subtitle="Operations at a glance" status={s ? `Figures for ${s.range.from} to ${s.range.to}` : "Loading figures…"}>
      {summary.error ? <p className="mb-4 text-sm font-semibold text-rose-600">{summary.error}</p> : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <h2 className="font-extrabold">Rides with a driver</h2>
            <Link href="/dispatch" className="text-sm font-semibold text-[#2563EB]">
              Open dispatch
            </Link>
          </div>
          <div className="space-y-2">
            {withDriver.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <div>
                  <p className="font-semibold">
                    {r.passenger.name} → {r.driver?.name ?? "Unassigned"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.pickup.address} → {r.drop.address}
                  </p>
                </div>
                <StatusBadge value={WITH_DRIVER_LABEL[r.status] ?? r.status} />
              </div>
            ))}
            {recent.data && withDriver.length === 0 ? <p className="text-sm text-slate-500">No rides with a driver right now.</p> : null}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 font-extrabold">Recent activity</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            {(activity.data ?? []).map((a) => (
              <li key={a.id} className="rounded-lg bg-[#F4F9D8]/70 px-3 py-2">
                <span className="font-semibold">{a.actorName ?? "System"}</span> {ACTION_TEXT[a.action] ?? a.action}
                <span className="block text-xs text-slate-500">{formatDate(a.createdAt)}</span>
              </li>
            ))}
            {activity.data && activity.data.length === 0 ? <li className="text-slate-500">No activity yet.</li> : null}
          </ul>
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
          {(queue.data ?? []).map((j) => (
            <div key={j.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-semibold">{j.passenger.name}</p>
                <StatusBadge value={j.priority === "sos" ? "SOS" : j.priority === "high" ? "High" : "Normal"} />
              </div>
              <p className="text-xs text-slate-500">
                {j.pickup.address} → {j.drop.address} · waiting {j.waitingSeconds}s
              </p>
            </div>
          ))}
          {queue.data && queue.data.length === 0 ? <p className="text-sm text-slate-500">Queue clear.</p> : null}
        </div>
      </div>
    </Shell>
  );
}
