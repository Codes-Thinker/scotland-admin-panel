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

export default function UsersPage() {
  const { users, setUserStatus } = useAdminStore();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");

  const rows = useMemo(() => {
    return users
      .filter((u) => (role === "All" ? true : u.role === role))
      .filter((u) => {
        const q = search.toLowerCase();
        return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
      });
  }, [users, search, role]);

  return (
    <Shell title="All users" subtitle={`${users.length} mock users · passengers, drivers, admin`}>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search users…">
        <select className="select w-full sm:w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
          <option>All</option>
          <option>Passenger</option>
          <option>Driver</option>
          <option>Admin</option>
        </select>
      </Toolbar>
      <p className="mb-3 text-sm text-slate-500">
        Showing <strong>{rows.length}</strong> users
      </p>

      <MobileCards>
        {rows.map((u) => (
          <MobileCard key={u.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <StatusBadge value={u.role} />
            </div>
            <MetaRow label="Phone" value={u.phone} />
            <MetaRow label="Trips" value={u.trips} />
            <MetaRow label="Status" value={<StatusBadge value={u.status} />} />
            <div className="flex flex-wrap gap-2">
              <button className="btn-lime" onClick={() => setUserStatus(u.id, "Active")}>Active</button>
              <button className="btn-ghost" onClick={() => setUserStatus(u.id, "Pending")}>Pending</button>
              <button className="btn-danger" onClick={() => setUserStatus(u.id, "Suspended")}>Suspend</button>
            </div>
          </MobileCard>
        ))}
      </MobileCards>

      <DesktopTable>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Trips</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-slate-100">
                <td className="px-3 py-3 font-semibold">{u.name}</td>
                <td className="px-3 py-3">{u.email}</td>
                <td className="px-3 py-3">{u.phone}</td>
                <td className="px-3 py-3"><StatusBadge value={u.role} /></td>
                <td className="px-3 py-3">{u.trips}</td>
                <td className="px-3 py-3"><StatusBadge value={u.status} /></td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-lime" onClick={() => setUserStatus(u.id, "Active")}>Active</button>
                    <button className="btn-ghost" onClick={() => setUserStatus(u.id, "Pending")}>Pending</button>
                    <button className="btn-danger" onClick={() => setUserStatus(u.id, "Suspended")}>Suspend</button>
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
