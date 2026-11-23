"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { DesktopTable, MetaRow, MobileCard, MobileCards, StatusBadge, Toolbar } from "@/components/ui";
import { api, type Paged } from "@/lib/api";
import { formatDate, formatPounds, runAction, useApi } from "@/lib/use-api";

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface PaymentRow {
  id: string;
  reference: string;
  amountPence: number;
  status: PaymentStatus;
  createdAt: string;
  ride: {
    id: string;
    rideType: string;
    status: string;
    pickup: string;
    drop: string;
    passengerName: string;
    driverName: string | null;
  };
}

interface SummaryPayload {
  revenue: { completedFarePence: number; paidPence: number; pendingPence: number; refundedPence: number };
}

const PAGE_SIZE = 50;

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

/** Mirrors the server's allowed transitions, so only valid buttons are shown. */
const NEXT_STATUSES: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ["paid", "failed"],
  failed: ["paid"],
  paid: ["refunded"],
  refunded: [],
};

const BUTTON_CLASS: Partial<Record<PaymentStatus, string>> = {
  paid: "btn-lime",
  failed: "btn-danger",
  refunded: "btn-blue",
};

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");
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

  const list = useApi<Paged<PaymentRow>>(`/admin/payments?${params.toString()}`);
  const summary = useApi<SummaryPayload>("/admin/reports/summary");
  const rows = list.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / PAGE_SIZE));

  async function setPaymentStatus(id: string, next: PaymentStatus) {
    setNotice(null);
    const error = await runAction(() =>
      api(`/admin/payments/${id}/status`, { method: "PATCH", body: { status: next } }),
    );
    if (error) setNotice(error);
    list.reload();
    summary.reload();
  }

  return (
    <Shell title="Payments" subtitle="Record payments as they settle, and refunds" status="Live data from the operations API">
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Paid (last 30 days)</p>
          <p className="text-2xl font-extrabold text-[#8FBF1F]">
            {formatPounds(summary.data?.revenue.paidPence)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Pending (last 30 days)</p>
          <p className="text-2xl font-extrabold text-[#2563EB]">
            {formatPounds(summary.data?.revenue.pendingPence)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Refunded (last 30 days)</p>
          <p className="text-2xl font-extrabold text-slate-600">
            {formatPounds(summary.data?.revenue.refundedPence)}
          </p>
        </div>
      </div>

      <Toolbar search={search} onSearch={setSearch} placeholder="Search reference or passenger…">
        <select
          className="select w-full sm:w-auto"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "all" | PaymentStatus);
            setPage(1);
          }}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </Toolbar>

      {notice ? <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{notice}</p> : null}
      {list.error ? <p className="mb-3 text-sm font-semibold text-rose-600">{list.error}</p> : null}
      <p className="mb-3 text-sm text-slate-500">
        {list.loading ? "Loading…" : <>Showing <strong>{rows.length}</strong> of <strong>{list.data?.total ?? 0}</strong> payments</>}
      </p>

      <MobileCards>
        {rows.map((p) => (
          <MobileCard key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold">{p.reference}</p>
              <StatusBadge value={STATUS_LABEL[p.status]} />
            </div>
            <MetaRow label="Passenger" value={p.ride.passengerName} />
            <MetaRow label="Driver" value={p.ride.driverName ?? "—"} />
            <MetaRow label="Route" value={`${p.ride.pickup} → ${p.ride.drop}`} />
            <MetaRow label="Amount" value={formatPounds(p.amountPence)} />
            <MetaRow label="Date" value={formatDate(p.createdAt)} />
            <PaymentActions payment={p} onSet={setPaymentStatus} />
          </MobileCard>
        ))}
      </MobileCards>

      <DesktopTable>
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-3">Ref</th>
              <th className="px-3 py-3">Passenger</th>
              <th className="px-3 py-3">Driver</th>
              <th className="px-3 py-3">Route</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-3 py-3 font-semibold">{p.reference}</td>
                <td className="px-3 py-3">{p.ride.passengerName}</td>
                <td className="px-3 py-3">{p.ride.driverName ?? "—"}</td>
                <td className="px-3 py-3">{p.ride.pickup} → {p.ride.drop}</td>
                <td className="px-3 py-3">{formatPounds(p.amountPence)}</td>
                <td className="px-3 py-3 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                <td className="px-3 py-3">
                  <StatusBadge value={STATUS_LABEL[p.status]} />
                </td>
                <td className="px-3 py-3">
                  <PaymentActions payment={p} onSet={setPaymentStatus} />
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

function PaymentActions({
  payment,
  onSet,
}: {
  payment: PaymentRow;
  onSet: (id: string, next: PaymentStatus) => void;
}) {
  const options = NEXT_STATUSES[payment.status];
  if (options.length === 0) return <span className="text-xs text-slate-500">Final</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((next) => (
        <button
          key={next}
          className={BUTTON_CLASS[next] ?? "btn-ghost"}
          onClick={() => onSet(payment.id, next)}
        >
          {next === "paid" ? "Mark paid" : next === "failed" ? "Mark failed" : "Refund"}
        </button>
      ))}
    </div>
  );
}
