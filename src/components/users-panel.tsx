"use client";

import { useEffect, useState } from "react";
import { api, currentUser, type ApiRole, type Paged } from "@/lib/api";
import { formatDate, runAction, useApi } from "@/lib/use-api";
import { DesktopTable, MetaRow, MobileCard, MobileCards, StatusBadge, Toolbar } from "./ui";

export interface ApiUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: ApiRole[];
  status: "active" | "pending" | "suspended";
  createdAt: string;
}

const PAGE_SIZE = 50;

const STATUS_LABEL: Record<ApiUserRow["status"], string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
};

const ROLE_LABEL: Record<ApiRole, string> = {
  passenger: "Passenger",
  driver: "Driver",
  admin: "Admin",
};

/**
 * Lists accounts from GET /admin/users and changes their status.
 * `fixedRole` limits the list to one role (used by the Passengers page).
 */
export function UsersPanel({ fixedRole }: { fixedRole?: ApiRole }) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [role, setRole] = useState<"all" | ApiRole>(fixedRole ?? "all");
  const [status, setStatus] = useState<"all" | ApiUserRow["status"]>("all");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const me = currentUser();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  const effectiveRole = fixedRole ?? (role === "all" ? undefined : role);
  if (effectiveRole) params.set("role", effectiveRole);
  if (status !== "all") params.set("status", status);
  if (debounced) params.set("q", debounced);

  const list = useApi<Paged<ApiUserRow>>(`/admin/users?${params.toString()}`);
  const rows = list.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / PAGE_SIZE));

  async function setUserStatus(id: string, next: ApiUserRow["status"]) {
    setNotice(null);
    const error = await runAction(() =>
      api(`/admin/users/${id}/status`, { method: "PATCH", body: { status: next } }),
    );
    if (error) setNotice(error);
    list.reload();
  }

  return (
    <>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search name, email or phone…">
        {fixedRole ? null : (
          <select
            className="select w-full sm:w-auto"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as "all" | ApiRole);
              setPage(1);
            }}
          >
            <option value="all">All roles</option>
            <option value="passenger">Passengers</option>
            <option value="driver">Drivers</option>
            <option value="admin">Admins</option>
          </select>
        )}
        <select
          className="select w-full sm:w-auto"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "all" | ApiUserRow["status"]);
            setPage(1);
          }}
        >
          <option value="all">Any status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </Toolbar>

      {notice ? <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{notice}</p> : null}
      {list.error ? <p className="mb-3 text-sm font-semibold text-rose-600">{list.error}</p> : null}

      <p className="mb-3 text-sm text-slate-500">
        {list.loading ? "Loading…" : <>Showing <strong>{rows.length}</strong> of <strong>{list.data?.total ?? 0}</strong></>}
      </p>

      <MobileCards>
        {rows.map((u) => (
          <MobileCard key={u.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <StatusBadge value={ROLE_LABEL[u.roles[0]] ?? u.roles.join(", ")} />
            </div>
            <MetaRow label="Phone" value={u.phone} />
            <MetaRow label="Joined" value={formatDate(u.createdAt)} />
            <MetaRow label="Status" value={<StatusBadge value={STATUS_LABEL[u.status]} />} />
            {u.id === me?.id ? <span className="text-xs text-slate-500">Your account</span> : <StatusActions status={u.status} onSet={(next) => setUserStatus(u.id, next)} />}
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
              <th className="px-3 py-3">Joined</th>
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
                <td className="px-3 py-3">
                  <StatusBadge value={ROLE_LABEL[u.roles[0]] ?? u.roles.join(", ")} />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                <td className="px-3 py-3">
                  <StatusBadge value={STATUS_LABEL[u.status]} />
                </td>
                <td className="px-3 py-3">
                  {u.id === me?.id ? <span className="text-xs text-slate-500">Your account</span> : <StatusActions status={u.status} onSet={(next) => setUserStatus(u.id, next)} />}
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
    </>
  );
}

function StatusActions({
  status,
  onSet,
}: {
  status: ApiUserRow["status"];
  onSet: (next: ApiUserRow["status"]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "active" ? (
        <button className="btn-lime" onClick={() => onSet("active")}>
          Activate
        </button>
      ) : null}
      {status !== "pending" ? (
        <button className="btn-ghost" onClick={() => onSet("pending")}>
          Mark pending
        </button>
      ) : null}
      {status !== "suspended" ? (
        <button className="btn-danger" onClick={() => onSet("suspended")}>
          Suspend
        </button>
      ) : null}
    </div>
  );
}
