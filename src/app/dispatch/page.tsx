"use client";

import { useState } from "react";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/ui";
import { useAdminStore } from "@/lib/store";

export default function DispatchPage() {
  const { dispatchQueue, drivers, rides, dispatchJob, setRideStatus, assignDriver } = useAdminStore();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const onlineDrivers = drivers.filter((d) => d.status === "Online");
  const openRides = rides.filter((r) => ["Queued", "Dispatched", "Active"].includes(r.status));

  return (
    <Shell title="Dispatch" subtitle="Assign drivers, clear queue, update ride pipeline.">
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Queue</p>
          <p className="text-3xl font-extrabold">{dispatchQueue.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Online drivers</p>
          <p className="text-3xl font-extrabold text-[#8FBF1F]">{onlineDrivers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Open rides</p>
          <p className="text-3xl font-extrabold text-[#2563EB]">{openRides.length}</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-extrabold">Dispatch queue</h2>
      <div className="mb-8 space-y-3">
        {dispatchQueue.map((job) => (
          <div key={job.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-extrabold">
                    {job.rideId} · {job.passenger}
                  </p>
                  <StatusBadge value={job.priority} />
                  <StatusBadge value={job.type} />
                </div>
                <p className="text-sm text-slate-600">
                  {job.pickup} → {job.destination}
                </p>
                <p className="text-xs text-slate-500">Waiting {job.waitingSec}s · suggested {job.suggestedDriver}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="select"
                  value={selected[job.id] ?? job.suggestedDriver}
                  onChange={(e) => setSelected((s) => ({ ...s, [job.id]: e.target.value }))}
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.status})
                    </option>
                  ))}
                </select>
                <button
                  className="btn-lime"
                  onClick={() => dispatchJob(job.id, selected[job.id] ?? job.suggestedDriver)}
                >
                  Dispatch now
                </button>
              </div>
            </div>
          </div>
        ))}
        {dispatchQueue.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            Queue empty — all jobs assigned.
          </p>
        ) : null}
      </div>

      <h2 className="mb-3 text-lg font-extrabold">Open rides pipeline</h2>
      <div className="space-y-3 lg:hidden">
        {openRides.map((r) => (
          <div key={r.id} className="card space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold">
                {r.id} · {r.passenger}
              </p>
              <StatusBadge value={r.status} />
            </div>
            <p className="text-sm text-slate-600">
              {r.pickup} → {r.destination}
            </p>
            <p className="text-sm">Driver: {r.driver || "Unassigned"}</p>
            <div className="flex flex-wrap gap-2">
              <select
                className="select w-full"
                defaultValue=""
                onChange={(e) => {
                  const d = drivers.find((x) => x.id === e.target.value);
                  if (d) assignDriver(r.id, d.name, d.id);
                }}
              >
                <option value="">Assign…</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button className="btn-blue" onClick={() => setRideStatus(r.id, "Active")}>Active</button>
              <button className="btn-lime" onClick={() => setRideStatus(r.id, "Completed")}>Complete</button>
              <button className="btn-danger" onClick={() => setRideStatus(r.id, "Cancelled")}>Cancel</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Ride</th>
                <th className="px-4 py-3">Passenger</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {openRides.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold">{r.id}</td>
                  <td className="px-4 py-3">{r.passenger}</td>
                  <td className="px-4 py-3">{r.driver || "—"}</td>
                  <td className="px-4 py-3">
                    {r.pickup} → {r.destination}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <select
                        className="select"
                        defaultValue=""
                        onChange={(e) => {
                          const d = drivers.find((x) => x.id === e.target.value);
                          if (d) assignDriver(r.id, d.name, d.id);
                        }}
                      >
                        <option value="">Assign…</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <button className="btn-blue" onClick={() => setRideStatus(r.id, "Active")}>Active</button>
                      <button className="btn-lime" onClick={() => setRideStatus(r.id, "Completed")}>Complete</button>
                      <button className="btn-danger" onClick={() => setRideStatus(r.id, "Cancelled")}>Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
