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

export default function DriversPage() {
  const { drivers, setDriverStatus, setDriverDocs } = useAdminStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => {
    return drivers
      .filter((d) => (status === "All" ? true : d.status === status))
      .filter((d) => {
        const q = search.toLowerCase();
        return !q || d.name.toLowerCase().includes(q) || d.zone.toLowerCase().includes(q) || d.plate.toLowerCase().includes(q);
      });
  }, [drivers, search, status]);

  return (
    <Shell title="Drivers" subtitle={`${drivers.length} mock drivers loaded`}>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search drivers, zone, plate…">
        <select className="select w-full sm:w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Online</option>
          <option>Offline</option>
          <option>On trip</option>
        </select>
      </Toolbar>
      <p className="mb-3 text-sm text-slate-500">
        Showing <strong>{rows.length}</strong> of <strong>{drivers.length}</strong>
      </p>

      <MobileCards>
        {rows.map((d) => (
          <MobileCard key={d.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">{d.name}</p>
                <p className="text-xs text-slate-500">{d.email}</p>
              </div>
              <StatusBadge value={d.status} />
            </div>
            <MetaRow label="Vehicle" value={`${d.vehicle} · ${d.plate}`} />
            <MetaRow label="Zone" value={d.zone} />
            <MetaRow label="Rating" value={`★ ${d.rating}`} />
            <MetaRow label="Rides / Earn" value={`${d.rides} · £${d.earnings.toFixed(2)}`} />
            <MetaRow label="Docs" value={<StatusBadge value={d.docs} />} />
            <div className="flex flex-wrap gap-2">
              <button className="btn-lime" onClick={() => setDriverStatus(d.id, "Online")}>Online</button>
              <button className="btn-ghost" onClick={() => setDriverStatus(d.id, "Offline")}>Offline</button>
              <button className="btn-blue" onClick={() => setDriverDocs(d.id, "Verified")}>Verify docs</button>
            </div>
          </MobileCard>
        ))}
      </MobileCards>

      <DesktopTable>
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-3">Driver</th>
              <th className="px-3 py-3">Vehicle</th>
              <th className="px-3 py-3">Zone</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-3 py-3">Rides</th>
              <th className="px-3 py-3">Earnings</th>
              <th className="px-3 py-3">Docs</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-b border-slate-100">
                <td className="px-3 py-3">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.email}</p>
                </td>
                <td className="px-3 py-3">{d.vehicle}<div className="text-xs text-slate-500">{d.plate}</div></td>
                <td className="px-3 py-3">{d.zone}</td>
                <td className="px-3 py-3">★ {d.rating}</td>
                <td className="px-3 py-3">{d.rides}</td>
                <td className="px-3 py-3 font-semibold">£{d.earnings.toFixed(2)}</td>
                <td className="px-3 py-3"><StatusBadge value={d.docs} /></td>
                <td className="px-3 py-3"><StatusBadge value={d.status} /></td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-lime" onClick={() => setDriverStatus(d.id, "Online")}>Online</button>
                    <button className="btn-ghost" onClick={() => setDriverStatus(d.id, "Offline")}>Offline</button>
                    <button className="btn-blue" onClick={() => setDriverDocs(d.id, "Verified")}>Verify</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DesktopTable>
    </Shell>
  );
}
