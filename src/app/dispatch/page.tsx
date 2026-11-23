"use client";

import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/ui";
import {
  assignRide,
  cancelRide,
  canCancel,
  distanceText,
  DriverPicker,
  RIDE_STATUS_LABEL,
  type DispatchRow,
  type RideRow,
  rideTypeText,
} from "@/components/rides-shared";
import { type Paged } from "@/lib/api";
import { formatPounds, useApi } from "@/lib/use-api";
import { useState } from "react";

const PRIORITY_LABEL: Record<DispatchRow["priority"], string> = {
  normal: "Normal",
  high: "High",
  sos: "SOS",
};

export default function DispatchPage() {
  const queue = useApi<DispatchRow[]>("/admin/dispatch/queue");
  const open = useApi<Paged<RideRow>>("/admin/rides?status=assigned&pageSize=100");
  const arrived = useApi<Paged<RideRow>>("/admin/rides?status=arrived&pageSize=100");
  const inProgress = useApi<Paged<RideRow>>("/admin/rides?status=in_progress&pageSize=100");
  const [notice, setNotice] = useState<string | null>(null);

  const openRides = [...(open.data?.data ?? []), ...(arrived.data?.data ?? []), ...(inProgress.data?.data ?? [])];
  const waiting = queue.data ?? [];

  function reloadAll() {
    queue.reload();
    open.reload();
    arrived.reload();
    inProgress.reload();
  }

  async function assign(rideId: string, driverId: string) {
    setNotice(null);
    const error = await assignRide(rideId, driverId);
    if (error) setNotice(error);
    reloadAll();
  }

  async function cancel(rideId: string) {
    const reason = window.prompt("Reason for cancelling (the driver and passenger see it):") ?? "";
    if (!reason.trim()) {
      setNotice("A reason is needed to cancel a ride.");
      return;
    }
    setNotice(null);
    const error = await cancelRide(rideId, reason.trim());
    if (error) setNotice(error);
    reloadAll();
  }

  return (
    <Shell title="Dispatch" subtitle="Assign waiting rides and watch the rides in progress" status="Live data from the operations API">
      {notice ? <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{notice}</p> : null}
      {queue.error ? <p className="mb-4 text-sm font-semibold text-rose-600">{queue.error}</p> : null}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Waiting for a driver</p>
          <p className="text-3xl font-extrabold">{waiting.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Driver on the way</p>
          <p className="text-3xl font-extrabold text-[#2563EB]">{(open.data?.total ?? 0) + (arrived.data?.total ?? 0)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">In progress</p>
          <p className="text-3xl font-extrabold text-[#8FBF1F]">{inProgress.data?.total ?? 0}</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-extrabold">Waiting for a driver</h2>
      <div className="mb-8 space-y-3">
        {waiting.map((job) => (
          <div key={job.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-extrabold">{job.passenger.name}</p>
                  <StatusBadge value={PRIORITY_LABEL[job.priority]} />
                  <StatusBadge value={rideTypeText(job)} />
                </div>
                <p className="text-sm text-slate-600">
                  {job.pickup.address} → {job.drop.address} · {distanceText(job.distanceM)}
                </p>
                <p className="text-xs text-slate-500">
                  Waiting {job.waitingSeconds}s · {job.offersOpen} driver{job.offersOpen === 1 ? "" : "s"} holding an offer
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DriverPicker onPick={(driverId) => assign(job.id, driverId)} placeholder="Dispatch to…" />
                {canCancel(job.status) ? (
                  <button className="btn-danger" onClick={() => cancel(job.id)}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {!queue.loading && waiting.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            Nothing waiting. Every requested ride has a driver.
          </p>
        ) : null}
      </div>

      <h2 className="mb-3 text-lg font-extrabold">Rides under way</h2>
      <div className="space-y-3">
        {openRides.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-extrabold">
                {r.passenger.name} → {r.driver?.name ?? "—"}
              </p>
              <p className="text-sm text-slate-600">
                {r.pickup.address} → {r.drop.address}
              </p>
              <p className="text-xs text-slate-500">{formatPounds(r.fareEstimatePence)} estimate</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={RIDE_STATUS_LABEL[r.status]} />
              {canCancel(r.status) ? (
                <button className="btn-danger" onClick={() => cancel(r.id)}>
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {openRides.length === 0 ? <p className="text-slate-500">No rides under way.</p> : null}
      </div>
    </Shell>
  );
}
