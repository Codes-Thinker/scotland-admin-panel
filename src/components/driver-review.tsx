"use client";

import { useState } from "react";
import { api, documentUrl } from "@/lib/api";
import { formatDate, runAction, useApi } from "@/lib/use-api";
import { StatusBadge } from "./ui";

export interface DocumentRow {
  type: string;
  status: "missing" | "pending" | "verified" | "expired";
  expiresAt: string | null;
  uploadedAt: string | null;
  reviewedAt: string | null;
}

export interface DriverDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountStatus: "active" | "pending" | "suspended";
  onlineStatus: string;
  operatingZone: string | null;
  vehicle: { makeModel: string; plate: string; category: string } | null;
  documentsVerified: number;
  documentsRequired: number;
  documents: DocumentRow[];
}

export const DOCUMENT_LABELS: Record<string, string> = {
  licence: "Driver's licence",
  council_licence: "Council licence",
  council_plate: "Council vehicle plate",
  insurance: "Car insurance",
  v5c: "Vehicle registration (V5C)",
};

/** Side panel to check a driver's five documents and approve, reject or expire each one. */
export function DriverReview({ driverId, onClose, onChanged }: { driverId: string; onClose: () => void; onChanged: () => void }) {
  const detail = useApi<DriverDetail>(`/admin/drivers/${driverId}`);
  const [notice, setNotice] = useState<string | null>(null);

  async function decide(type: string, status: "verified" | "expired" | "missing") {
    const note =
      status === "missing"
        ? window.prompt("Reason for rejecting this document (the driver will see it):") ?? ""
        : undefined;
    if (status === "missing" && !note?.trim()) {
      setNotice("A reason is needed to reject a document.");
      return;
    }
    setNotice(null);
    const error = await runAction(() =>
      api(`/admin/drivers/${driverId}/documents/${type}`, {
        method: "PATCH",
        body: note !== undefined ? { status, note: note.trim() } : { status },
      }),
    );
    if (error) setNotice(error);
    detail.reload();
    onChanged();
  }

  async function view(type: string) {
    setNotice(null);
    try {
      const url = await documentUrl(driverId, type);
      window.open(url, "_blank", "noopener");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not open the file.");
    }
  }

  const d = detail.data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" role="dialog" aria-modal="true">
      <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Driver documents</p>
            <h2 className="text-xl font-extrabold">{d?.name ?? "Loading…"}</h2>
            {d ? (
              <p className="text-sm text-slate-500">
                {d.email} · {d.phone}
              </p>
            ) : null}
          </div>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        {detail.error ? <p className="text-sm font-semibold text-rose-600">{detail.error}</p> : null}
        {notice ? <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{notice}</p> : null}

        {d ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-slate-500">Account</p>
                <StatusBadge value={d.accountStatus === "active" ? "Active" : d.accountStatus === "pending" ? "Pending" : "Suspended"} />
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-slate-500">Documents</p>
                <p className="font-extrabold">
                  {d.documentsVerified} of {d.documentsRequired} verified
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 col-span-2">
                <p className="text-slate-500">Vehicle</p>
                <p className="font-semibold">
                  {d.vehicle ? `${d.vehicle.makeModel} · ${d.vehicle.plate}` : "No vehicle on file"} · {d.operatingZone ?? "No zone"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {d.documents.map((doc) => (
                <div key={doc.type} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-semibold">{DOCUMENT_LABELS[doc.type] ?? doc.type}</p>
                    <StatusBadge value={doc.status === "verified" ? "Verified" : doc.status === "expired" ? "Expired" : doc.status === "pending" ? "Pending" : "Missing"} />
                  </div>
                  <p className="mb-2 text-xs text-slate-500">
                    Uploaded {formatDate(doc.uploadedAt)}
                    {doc.expiresAt ? ` · expires ${formatDate(doc.expiresAt)}` : ""}
                    {doc.reviewedAt ? ` · reviewed ${formatDate(doc.reviewedAt)}` : ""}
                  </p>
                  {doc.uploadedAt ? (
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost" onClick={() => view(doc.type)}>
                        View file
                      </button>
                      {doc.status !== "verified" ? (
                        <button className="btn-lime" onClick={() => decide(doc.type, "verified")}>
                          Verify
                        </button>
                      ) : null}
                      {doc.status !== "expired" ? (
                        <button className="btn-ghost" onClick={() => decide(doc.type, "expired")}>
                          Mark expired
                        </button>
                      ) : null}
                      <button className="btn-danger" onClick={() => decide(doc.type, "missing")}>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Not uploaded yet.</p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
