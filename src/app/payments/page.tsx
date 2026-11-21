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

export default function PaymentsPage() {
  const { payments, markPayment } = useAdminStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => {
    return payments
      .filter((p) => (status === "All" ? true : p.status === status))
      .filter((p) => {
        const q = search.toLowerCase();
        return !q || p.ref.toLowerCase().includes(q) || p.rider.toLowerCase().includes(q) || p.driver.toLowerCase().includes(q);
      });
  }, [payments, search, status]);

  const paid = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

  return (
    <Shell title="Payments" subtitle={`${payments.length} mock transactions`}>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Paid revenue</p>
          <p className="text-2xl font-extrabold text-[#8FBF1F]">£{paid.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-2xl font-extrabold text-[#2563EB]">£{pending.toFixed(2)}</p>
        </div>
      </div>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search reference / rider…">
        <select className="select w-full sm:w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Failed</option>
          <option>Refunded</option>
        </select>
      </Toolbar>
      <p className="mb-3 text-sm text-slate-500">
        Showing <strong>{rows.length}</strong> payments
      </p>

      <MobileCards>
        {rows.map((p) => (
          <MobileCard key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold">{p.ref}</p>
              <StatusBadge value={p.status} />
            </div>
            <MetaRow label="Ride" value={p.rideId} />
            <MetaRow label="Rider" value={p.rider} />
            <MetaRow label="Driver" value={p.driver} />
            <MetaRow label="Amount" value={`£${p.amount.toFixed(2)}`} />
            <MetaRow label="Date" value={p.date} />
            <div className="flex flex-wrap gap-2">
              <button className="btn-lime" onClick={() => markPayment(p.id, "Paid")}>Paid</button>
              <button className="btn-ghost" onClick={() => markPayment(p.id, "Pending")}>Pending</button>
              <button className="btn-danger" onClick={() => markPayment(p.id, "Failed")}>Failed</button>
              <button className="btn-blue" onClick={() => markPayment(p.id, "Refunded")}>Refund</button>
            </div>
          </MobileCard>
        ))}
      </MobileCards>

      <DesktopTable>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-3">Ref</th>
              <th className="px-3 py-3">Ride</th>
              <th className="px-3 py-3">Rider</th>
              <th className="px-3 py-3">Driver</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-3 py-3 font-semibold">{p.ref}</td>
                <td className="px-3 py-3">{p.rideId}</td>
                <td className="px-3 py-3">{p.rider}</td>
                <td className="px-3 py-3">{p.driver}</td>
                <td className="px-3 py-3">£{p.amount.toFixed(2)}</td>
                <td className="px-3 py-3">{p.date}</td>
                <td className="px-3 py-3"><StatusBadge value={p.status} /></td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-lime" onClick={() => markPayment(p.id, "Paid")}>Paid</button>
                    <button className="btn-ghost" onClick={() => markPayment(p.id, "Pending")}>Pending</button>
                    <button className="btn-danger" onClick={() => markPayment(p.id, "Failed")}>Failed</button>
                    <button className="btn-blue" onClick={() => markPayment(p.id, "Refunded")}>Refund</button>
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
