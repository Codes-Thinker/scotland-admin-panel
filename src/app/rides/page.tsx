"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { DesktopTable, MetaRow, MobileCard, MobileCards, StatusBadge, Toolbar } from "@/components/ui";
import {
  assignRide,
  cancelRide,
  canAssign,
  canCancel,
  distanceText,
  DriverPicker,
  RIDE_STATUS_LABEL,
  type RideRow,
  type RideStatus,
  rideTypeText,
} from "@/components/rides-shared";
import { type Paged } from "@/lib/api";
import { formatDate, formatPounds, useApi } from "@/lib/use-api";

const PAGE_SIZE = 50;

export default function RidesPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<"all" | RideStatus>("all");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (debounced) params.set("q", debounced);
  if (status !== "all") params.set("status", status);

  const list = useApi<Paged<RideRow>>(`/admin/rides?${params.toString()}`);
  const rows = list.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / PAGE_SIZE));

  async function assign(rideId: string, driverId: string) {
    setNotice(null);
    const error = await assignRide(rideId, driverId);
    if (error) setNotice(error);
    list.reload();
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
    list.reload();
  }

  return (
    <Shell title="Rides" subtitle="Every ride, with assignment and cancellation" status="Live data from the operations API">
      <Toolbar search={search} onSearch={setSearch} placeholder="Search passenger or address…">
        <select
          className="select w-full sm:w-auto"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "all" | RideStatus);
            setPage(1);
          }}
        >
          <option value="all">All statuses</option>
          {(Object.keys(RIDE_STATUS_LABEL) as RideStatus[]).map((s) => (
            <option key={s} value={s}>
              {RIDE_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </Toolbar>

      {notice ? <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{notice}</p> : null}
      {list.error ? <p className="mb-3 text-sm font-semibold text-rose-600">{list.error}</p> : null}
      <p className="mb-3 text-sm text-slate-500">
        {list.loading ? "Loading…" : <>Showing <strong>{rows.length}</strong> of <strong>{list.data?.total ?? 0}</strong> rides</>}
      </p>

      <MobileCards>
        {rows.map((r) => (
          <MobileCard key={r.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">{r.passenger.name}</p>
                <p className="text-xs text-slate-500">{formatDate(r.requestedAt)}</p>
              </div>
              <StatusBadge value={RIDE_STATUS_LABEL[r.status]} />
            </div>
            <MetaRow label="Driver" value={r.driver?.name ?? "Unassigned"} />
            <MetaRow
              label="Route"
              value={
                <span>
                  {r.pickup.address} → {r.drop.address}
                  <span className="block text-xs font-normal text-slate-500">{distanceText(r.distanceM)}</span>
                </span>
              }
            />
            <MetaRow label="Type" value={rideTypeText(r)} />
            <MetaRow label="Fare" value={formatPounds(r.fareFinalPence ?? r.fareEstimatePence)} />
            <RideActions ride={r} onAssign={assign} onCancel={cancel} />
          </MobileCard>
        ))}
      </MobileCards>

      <DesktopTable>
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-3">Requested</th>
              <th className="px-3 py-3">Passenger</th>
              <th className="px-3 py-3">Driver</th>
              <th className="px-3 py-3">Route</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Fare</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="px-3 py-3 whitespace-nowrap">{formatDate(r.requestedAt)}</td>
                <td className="px-3 py-3 font-semibold">{r.passenger.name}</td>
                <td className="px-3 py-3">{r.driver?.name ?? "—"}</td>
                <td className="px-3 py-3">
                  {r.pickup.address} → {r.drop.address}
                  <div className="text-xs text-slate-500">{distanceText(r.distanceM)}</div>
                </td>
                <td className="px-3 py-3">{rideTypeText(r)}</td>
                <td className="px-3 py-3">{formatPounds(r.fareFinalPence ?? r.fareEstimatePence)}</td>
                <td className="px-3 py-3">
                  <StatusBadge value={RIDE_STATUS_LABEL[r.status]} />
                </td>
                <td className="px-3 py-3">
                  <RideActions ride={r} onAssign={assign} onCancel={cancel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DesktopTable>

      {(list.data?.total ?? 0) > PAGE_SIZE ? (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button className="btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </Shell>
  );
}

function RideActions({
  ride,
  onAssign,
  onCancel,
}: {
  ride: RideRow;
  onAssign: (rideId: string, driverId: string) => void;
  onCancel: (rideId: string) => void;
}) {
  if (!canAssign(ride.status) && !canCancel(ride.status)) {
    return <span className="text-xs text-slate-500">No actions</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {canAssign(ride.status) ? (
        <DriverPicker onPick={(driverId) => onAssign(ride.id, driverId)} />
      ) : null}
      {canCancel(ride.status) ? (
        <button className="btn-danger" onClick={() => onCancel(ride.id)}>
          Cancel
        </button>
      ) : null}
    </div>
  );
}
