"use client";

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    Completed: "bg-emerald-50 text-emerald-700",
    Paid: "bg-emerald-50 text-emerald-700",
    Verified: "bg-emerald-50 text-emerald-700",
    Online: "bg-[#F4F9D8] text-[#5f8a12]",
    Pending: "bg-amber-50 text-amber-700",
    Queued: "bg-amber-50 text-amber-700",
    Dispatched: "bg-blue-50 text-blue-700",
    "On trip": "bg-blue-50 text-blue-700",
    Cancelled: "bg-rose-50 text-rose-700",
    Failed: "bg-rose-50 text-rose-700",
    Suspended: "bg-rose-50 text-rose-700",
    Expired: "bg-rose-50 text-rose-700",
    Offline: "bg-slate-100 text-slate-600",
    Refunded: "bg-slate-100 text-slate-600",
    SOS: "bg-rose-100 text-rose-800",
    High: "bg-orange-50 text-orange-700",
    Normal: "bg-slate-100 text-slate-600",
    Passenger: "bg-[#F4F9D8] text-[#5f8a12]",
    Driver: "bg-blue-50 text-blue-700",
    Admin: "bg-violet-50 text-violet-700",
    Standard: "bg-slate-100 text-slate-700",
    Emergency: "bg-rose-50 text-rose-700",
    Scheduled: "bg-blue-50 text-blue-700",
    Roadside: "bg-amber-50 text-amber-800",
  };
  return <span className={`badge ${map[value] ?? "bg-slate-100 text-slate-700"}`}>{value}</span>;
}

export function Toolbar({
  search,
  onSearch,
  placeholder,
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        className="input w-full sm:max-w-sm"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
      />
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      {text}
    </p>
  );
}

/** Desktop table wrapper — never stretches page; scroll stays inside if needed */
export function DesktopTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="card hidden overflow-hidden lg:block">
      <div className="w-full overflow-x-auto">{children}</div>
    </div>
  );
}

export function MobileCards({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 lg:hidden">{children}</div>;
}

export function MobileCard({ children }: { children: React.ReactNode }) {
  return <div className="card space-y-3 p-4">{children}</div>;
}

export function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}
