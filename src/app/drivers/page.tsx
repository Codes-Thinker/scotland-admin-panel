"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { DriverReview } from "@/components/driver-review";
import { DesktopTable, MetaRow, MobileCard, MobileCards, StatusBadge, Toolbar } from "@/components/ui";
import { api, type Paged } from "@/lib/api";
import { runAction, useApi } from "@/lib/use-api";

interface DriverRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountStatus: "active" | "pending" | "suspended";
  onlineStatus: "online" | "offline" | "on_trip";
  operatingZone: string | null;
  ratingAvg: number;
  ridesCount: number;
  vehicle: { makeModel: string; plate: string; category: string } | null;
  documentsVerified: number;
  documentsRequired: number;
}

const PAGE_SIZE = 50;

const ACCOUNT_LABEL: Record<DriverRow["accountStatus"], string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
};

const ONLINE_LABEL: Record<DriverRow["onlineStatus"], string> = {
  online: "Online",
  offline: "Offline",
  on_trip: "On trip",
};

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [account, setAccount] = useState<"all" | DriverRow["accountStatus"]>("all");
  const [online, setOnline] = useState<"all" | DriverRow["onlineStatus"]>("all");
  const [zone, setZone] = useState("");
  const [page, setPage] = useState(1);
  const [reviewing, setReviewing] = useState<string | null>(null);
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
  if (account !== "all") params.set("status", account);
  if (online !== "all") params.set("onlineStatus", online);
  if (zone.trim()) params.set("zone", zone.trim());

  const list = useApi<Paged<DriverRow>>(`/admin/drivers?${params.toString()}`);
  const rows = list.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / PAGE_SIZE));

  async function setAccountStatus(id: string, next: DriverRow["accountStatus"]) {
    setNotice(null);
    const error = await runAction(() => api(`/admin/users/${id}/status`, { method: "PATCH", body: { status: next } }));
    if (error) setNotice(error);
    list.reload();
  }

  return (
    <Shell title="Drivers" subtitle="Approve accounts, check documents, and see who is working" status="Live data from the operations API">
      <Toolbar search={search} onSearch={setSearch} placeholder="Search name, email, phone or plate…">
        <select
          className="select w-full sm:w-auto"
          value={account}
          onChange={(e) => {
            setAccount(e.target.value as "all" | DriverRow["accountStatus"]);
            setPage(1);
          }}
        >
          <option value="all">Any account</option>
          <option value="pending">Awaiting approval</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          className="select w-full sm:w-auto"
          value={online}
          onChange={(e) => {
            setOnline(e.target.value as "all" | DriverRow["onlineStatus"]);
            setPage(1);
          }}
        >
          <option value="all">Any availability</option>
          <option value="online">Online</option>
          <option value="on_trip">On trip</option>
          <option value="offline">Offline</option>
        </select>
        <input
          className="input w-full sm:w-44"
          placeholder="Zone"
          value={zone}
          onChange={(e) => {
            setZone(e.target.value);
            setPage(1);
          }}
        />
      </Toolbar>

      {notice ? <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{notice}</p> : null}
      {list.error ? <p className="mb-3 text-sm font-semibold text-rose-600">{list.error}</p> : null}
      <p className="mb-3 text-sm text-slate-500">
        {list.loading ? "Loading…" : <>Showing <strong>{rows.length}</strong> of <strong>{list.data?.total ?? 0}</strong></>}
      </p>

      <MobileCards>
        {rows.map((d) => (
          <MobileCard key={d.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">{d.name}</p>
                <p className="text-xs text-slate-500">{d.email}</p>
              </div>
              <StatusBadge value={ONLINE_LABEL[d.onlineStatus]} />
            </div>
            <MetaRow label="Vehicle" value={d.vehicle ? `${d.vehicle.makeModel} · ${d.vehicle.plate}` : "—"} />
            <MetaRow label="Zone" value={d.operatingZone ?? "—"} />
            <MetaRow label="Rating" value={`★ ${d.ratingAvg.toFixed(2)}`} />
            <MetaRow label="Rides" value={d.ridesCount} />
            <MetaRow label="Documents" value={`${d.documentsVerified} of ${d.documentsRequired} verified`} />
            <MetaRow label="Account" value={<StatusBadge value={ACCOUNT_LABEL[d.accountStatus]} />} />
            <DriverActions
              driver={d}
              onReview={() => setReviewing(d.id)}
              onSetAccount={(next) => setAccountStatus(d.id, next)}
            />
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
              <th className="px-3 py-3">Documents</th>
              <th className="px-3 py-3">Account</th>
              <th className="px-3 py-3">Availability</th>
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
                <td className="px-3 py-3">
                  {d.vehicle ? d.vehicle.makeModel : "—"}
                  <div className="text-xs text-slate-500">{d.vehicle?.plate}</div>
                </td>
                <td className="px-3 py-3">{d.operatingZone ?? "—"}</td>
                <td className="px-3 py-3">★ {d.ratingAvg.toFixed(2)}</td>
                <td className="px-3 py-3">{d.ridesCount}</td>
                <td className="px-3 py-3">
                  {d.documentsVerified} / {d.documentsRequired}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge value={ACCOUNT_LABEL[d.accountStatus]} />
                </td>
                <td className="px-3 py-3">
                  <StatusBadge value={ONLINE_LABEL[d.onlineStatus]} />
                </td>
                <td className="px-3 py-3">
                  <DriverActions
                    driver={d}
                    onReview={() => setReviewing(d.id)}
                    onSetAccount={(next) => setAccountStatus(d.id, next)}
                  />
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

      {reviewing ? (
        <DriverReview driverId={reviewing} onClose={() => setReviewing(null)} onChanged={() => list.reload()} />
      ) : null}
    </Shell>
  );
}

function DriverActions({
  driver,
  onReview,
  onSetAccount,
}: {
  driver: DriverRow;
  onReview: () => void;
  onSetAccount: (next: DriverRow["accountStatus"]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn-blue" onClick={onReview}>
        Documents
      </button>
      {driver.accountStatus !== "active" ? (
        <button className="btn-lime" onClick={() => onSetAccount("active")}>
          Approve
        </button>
      ) : null}
      {driver.accountStatus !== "suspended" ? (
        <button className="btn-danger" onClick={() => onSetAccount("suspended")}>
          Suspend
        </button>
      ) : null}
    </div>
  );
}
