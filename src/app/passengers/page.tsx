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

export default function PassengersPage() {
  const { users, rides, setUserStatus } = useAdminStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const passengers = useMemo(() => {
    return users
      .filter((u) => u.role === "Passenger")
      .filter((u) => (status === "All" ? true : u.status === status))
      .filter((u) => {
        const q = search.toLowerCase();
        return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
      });
  }, [users, search, status]);

  return (
    <Shell title="Passengers" subtitle={`${passengers.length} passengers in view`}>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search passengers…">
        <select className="select w-full sm:w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </select>
      </Toolbar>

      <MobileCards>
        {passengers.map((p) => {
          const open = rides.filter(
            (r) => r.passengerId === p.id && !["Completed", "Cancelled"].includes(r.status),
          ).length;
          return (
            <MobileCard key={p.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-extrabold">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.email}</p>
                </div>
                <StatusBadge value={p.status} />
              </div>
              <MetaRow label="Phone" value={p.phone} />
              <MetaRow label="Joined" value={p.joined} />
              <MetaRow label="Trips / Open" value={`${p.trips} / ${open}`} />
              <div className="flex flex-wrap gap-2">
                <button className="btn-lime" onClick={() => setUserStatus(p.id, "Active")}>Activate</button>
                <button className="btn-danger" onClick={() => setUserStatus(p.id, "Suspended")}>Suspend</button>
              </div>
            </MobileCard>
          );
        })}
      </MobileCards>

      <DesktopTable>
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Contact</th>
              <th className="px-3 py-3">Joined</th>
              <th className="px-3 py-3">Trips</th>
              <th className="px-3 py-3">Open</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((p) => {
              const open = rides.filter(
                (r) => r.passengerId === p.id && !["Completed", "Cancelled"].includes(r.status),
              ).length;
              return (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-semibold">{p.name}</td>
                  <td className="px-3 py-3">{p.email}<div className="text-xs text-slate-500">{p.phone}</div></td>
                  <td className="px-3 py-3">{p.joined}</td>
                  <td className="px-3 py-3">{p.trips}</td>
                  <td className="px-3 py-3">{open}</td>
                  <td className="px-3 py-3"><StatusBadge value={p.status} /></td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-lime" onClick={() => setUserStatus(p.id, "Active")}>Activate</button>
                      <button className="btn-danger" onClick={() => setUserStatus(p.id, "Suspended")}>Suspend</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DesktopTable>
    </Shell>
  );
}
