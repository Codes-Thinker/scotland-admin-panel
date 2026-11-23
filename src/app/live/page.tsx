"use client";

import { Shell } from "@/components/Shell";
import { DesktopTable, MetaRow, MobileCard, MobileCards, StatusBadge } from "@/components/ui";
import { RIDE_STATUS_LABEL, type RideRow } from "@/components/rides-shared";
import { type Paged } from "@/lib/api";
import { useApi } from "@/lib/use-api";

interface OnlineDriver {
  id: string;
  name: string;
  onlineStatus: "online" | "offline" | "on_trip";
  operatingZone: string | null;
  vehicle: { plate: string } | null;
}

const ONLINE_LABEL: Record<OnlineDriver["onlineStatus"], string> = {
  online: "Online",
  offline: "Offline",
  on_trip: "On trip",
};

export default function LivePage() {
  const assigned = useApi<Paged<RideRow>>("/admin/rides?status=assigned&pageSize=100", { pollMs: 15000 });
  const arrived = useApi<Paged<RideRow>>("/admin/rides?status=arrived&pageSize=100", { pollMs: 15000 });
  const inProgress = useApi<Paged<RideRow>>("/admin/rides?status=in_progress&pageSize=100", { pollMs: 15000 });
  const drivers = useApi<Paged<OnlineDriver>>("/admin/drivers?onlineStatus=on_trip&pageSize=100", { pollMs: 15000 });
  const free = useApi<Paged<OnlineDriver>>("/admin/drivers?onlineStatus=online&pageSize=100", { pollMs: 15000 });

  const active = [...(assigned.data?.data ?? []), ...(arrived.data?.data ?? []), ...(inProgress.data?.data ?? [])];
  const onlineNow = [...(drivers.data?.data ?? []), ...(free.data?.data ?? [])];

  return (
    <Shell title="Live" subtitle="Rides under way and drivers on the road" status="Updates every 15 seconds">
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Rides under way</p>
          <p className="text-3xl font-extrabold">{active.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Drivers online</p>
          <p className="text-3xl font-extrabold text-[#8FBF1F]">{free.data?.total ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Drivers on a trip</p>
          <p className="text-3xl font-extrabold text-[#2563EB]">{drivers.data?.total ?? 0}</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-extrabold">Rides under way</h2>
      <MobileCards>
        {active.map((r) => (
          <MobileCard key={r.id}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold">{r.passenger.name}</p>
              <StatusBadge value={RIDE_STATUS_LABEL[r.status]} />
            </div>
            <MetaRow label="Driver" value={r.driver?.name ?? "—"} />
            <MetaRow label="Route" value={`${r.pickup.address} → ${r.drop.address}`} />
          </MobileCard>
        ))}
      </MobileCards>
      <DesktopTable>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-3">Passenger</th>
              <th className="px-3 py-3">Driver</th>
              <th className="px-3 py-3">Route</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {active.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="px-3 py-3 font-semibold">{r.passenger.name}</td>
                <td className="px-3 py-3">{r.driver?.name ?? "—"}</td>
                <td className="px-3 py-3">{r.pickup.address} → {r.drop.address}</td>
                <td className="px-3 py-3"><StatusBadge value={RIDE_STATUS_LABEL[r.status]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DesktopTable>
      {!assigned.loading && active.length === 0 ? <p className="mt-3 text-slate-500">No rides under way right now.</p> : null}

      <h2 className="mb-3 mt-8 text-lg font-extrabold">Drivers</h2>
      <div className="card p-4">
        <p className="mb-3 text-sm text-slate-500">
          Driver positions are stored by the API but the map is not connected yet. This list shows who is available.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {onlineNow.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="text-xs text-slate-500">
                  {d.operatingZone ?? "No zone"} · {d.vehicle?.plate ?? "No vehicle"}
                </p>
              </div>
              <StatusBadge value={ONLINE_LABEL[d.onlineStatus]} />
            </div>
          ))}
          {onlineNow.length === 0 ? <p className="text-sm text-slate-500">No drivers online.</p> : null}
        </div>
      </div>
    </Shell>
  );
}
