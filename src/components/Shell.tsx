"use client";

import { MobileBottomNav } from "./MobileBottomNav";
import { Sidebar } from "./Sidebar";

export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1A1A1A]">
      {/* Desktop: side nav */}
      <Sidebar />

      {/* Mobile: bottom tabs like WhatsApp / Instagram */}
      <MobileBottomNav />

      <div className="flex min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-gradient-to-b from-[#C8E84A] via-[#F4F9D8] to-white px-4 pb-4 pt-3 sm:px-6">
          <div className="mb-3">
            <p className="text-xs font-medium text-[#6B7280]">Fife Nearby Taxis · Admin</p>
            <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
            {subtitle ? <p className="mt-0.5 text-sm text-[#6B7280]">{subtitle}</p> : null}
          </div>
          <div className="rounded-2xl border border-[#8FBF1F]/35 bg-white/80 px-3 py-2 sm:px-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</p>
            <p className="text-sm font-bold">Mock data connected · actions work across pages</p>
          </div>
        </header>
        {/* pb clears fixed bottom tab bar on mobile */}
        <main className="w-full max-w-full flex-1 overflow-x-auto p-4 pb-28 sm:p-6 lg:pb-6">{children}</main>
      </div>
    </div>
  );
}
