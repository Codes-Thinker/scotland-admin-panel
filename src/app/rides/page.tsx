"use client";

import { useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import {
  DesktopTable,
  MetaRow,
  MobileCard,
  MobileCards,
  StatusBadge,
  Toolbar,
} from "@/components/ui";
import { useAdminStore } from "@/lib/store";

export default function RidesPage() {
  const { rides, drivers, setRideStatus, assignDriver } = useAdminStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [bucket, setBucket] = useState<"All" | "Complete" | "Incomplete">("All");

  const rows = useMemo(() => {
    return rides
      .filter((r) => {
        if (bucket === "Complete") return r.status === "Completed";
        if (bucket === "Incomplete") return !["Completed", "Cancelled"].includes(r.status);
        return true;
      })
      .filter((r) => (status === "All" ? true : r.status === status))
      .filter((r) => {
        const q = search.toLowerCase();
        return (
          !q ||
          r.id.toLowerCase().includes(q) ||
          r.passenger.toLowerCase().includes(q) ||
          r.driver.toLowerCase().includes(q) ||
          r.pickup.toLowerCase().includes(q)
        );
      });
  }, [rides, search, status, bucket]);

  const completed = rides.filter((r) => r.status === "Completed").length;
  const incomplete = rides.filter((r) => !["Completed", "Cancelled"].includes(r.status)).length;

  function Actions({ rideId }: { rideId: string }) {
    return (
      <div className="flex flex-wrap gap-2">
        <select
          className="select max-w-full"
          defaultValue=""
          onChange={(e) => {
            const d = drivers.find((x) => x.id === e.target.value);
            if (d) assignDriver(rideId, d.name, d.id);
          }}
        >
          <option value="">Assign driver</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <button className="btn-lime" onClick={() => setRideStatus(rideId, "Completed")}>
          Complete
        </button>
        <button className="btn-danger" onClick={() => setRideStatus(rideId, "Cancelled")}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <Shell title="Rides" subtitle={`${rides.length} mock rides loaded · filters below`}>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          className={`card p-4 text-left ${bucket === "All" ? "border-[#8FBF1F] ring-1 ring-[#8FBF1F]" : ""}`}
          onClick={() => setBucket("All")}
        >
          <p className="text-xs text-slate-500">All rides</p>
          <p className="text-2xl font-extrabold">{rides.length}</p>
        </button>
        <button
          type="button"
          className={`card p-4 text-left ${bucket === "Complete" ? "border-[#8FBF1F] ring-1 ring-[#8FBF1F]" : ""}`}
          onClick={() => setBucket("Complete")}
        >
          <p className="text-xs text-slate-500">Completed</p>
          <p className="text-2xl font-extrabold text-emerald-600">{completed}</p>
        </button>
        <button
          type="button"
          className={`card p-4 text-left ${bucket === "Incomplete" ? "border-[#2563EB] ring-1 ring-[#2563EB]" : ""}`}
          onClick={() => setBucket("Incomplete")}
        >
          <p className="text-xs text-slate-500">Incomplete / open</p>
          <p className="text-2xl font-extrabold text-[#2563EB]">{incomplete}</p>
        </button>
      </div>

      <Toolbar search={search} onSearch={setSearch} placeholder="Search ride, passenger, driver…">
        <select className="select w-full sm:w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Queued</option>
          <option>Dispatched</option>
          <option>Active</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </Toolbar>

      <p className="mb-3 text-sm text-slate-500">
        Showing <strong>{rows.length}</strong> of <strong>{rides.length}</strong> rides
      </p>

      {rows.length === 0 ? (
        <div className="card p-6 text-center text-slate-500">
          No rides match this filter. Tap <strong>All rides</strong> above to see mock data.
        </div>
      ) : null}

      {/* Mobile: stacked cards — no sideways scroll */}
      <MobileCards>
        {rows.map((r) => (
          <MobileCard key={r.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">
                  {r.id} · {r.passenger}
                </p>
                <p className="text-xs text-slate-500">{r.when}</p>
              </div>
              <StatusBadge value={r.status} />
            </div>
            <MetaRow label="Driver" value={r.driver || "Unassigned"} />
            <MetaRow
              label="Route"
              value={
                <span>
                  {r.pickup} → {r.destination}
                  <span className="block text-xs font-normal text-slate-500">{r.distance}</span>
                </span>
              }
            />
            <MetaRow label="Type" value={<StatusBadge value={r.type} />} />
            <MetaRow label="Fare" value={`£${r.fare.toFixed(2)}`} />
            <MetaRow label="Payment" value={<StatusBadge value={r.payment} />} />
            <Actions rideId={r.id} />
          </MobileCard>
        ))}
      </MobileCards>

      {/* Desktop table */}
      <DesktopTable>
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-3">When</th>
              <th className="px-3 py-3">Ride</th>
              <th className="px-3 py-3">Passenger</th>
              <th className="px-3 py-3">Driver</th>
              <th className="px-3 py-3">Route</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Fare</th>
              <th className="px-3 py-3">Pay</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="px-3 py-3 whitespace-nowrap">{r.when}</td>
                <td className="px-3 py-3 font-semibold">{r.id}</td>
                <td className="px-3 py-3">{r.passenger}</td>
                <td className="px-3 py-3">{r.driver || "—"}</td>
                <td className="px-3 py-3">
                  {r.pickup} → {r.destination}
                  <div className="text-xs text-slate-500">{r.distance}</div>
                </td>
                <td className="px-3 py-3">{r.type}</td>
                <td className="px-3 py-3">£{r.fare.toFixed(2)}</td>
                <td className="px-3 py-3">
                  <StatusBadge value={r.payment} />
                </td>
                <td className="px-3 py-3">
                  <StatusBadge value={r.status} />
                </td>
                <td className="px-3 py-3">
                  <Actions rideId={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DesktopTable>
    </Shell>
  );
}
