"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-current"
      aria-hidden
    >
      {children}
    </span>
  );
}

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons = {
  overview: (
    <svg {...svgProps}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  dispatch: (
    <svg {...svgProps}>
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  rides: (
    <svg {...svgProps}>
      <path d="M3 13h13l3-5H8L3 13Z" />
      <path d="M5 13v4h2M14 13v4h2" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="15.5" cy="17.5" r="1.5" />
      <path d="M16 8h3l2 3" />
    </svg>
  ),
  live: (
    <svg {...svgProps}>
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  users: (
    <svg {...svgProps}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  passengers: (
    <svg {...svgProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  drivers: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  ),
  payments: (
    <svg {...svgProps}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  ),
  pricing: (
    <svg {...svgProps}>
      <path d="M12 3v18" />
      <path d="M16 7H9.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H7" />
    </svg>
  ),
  reports: (
    <svg {...svgProps}>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15v-4M12 15V8M16 15v-6" />
    </svg>
  ),
  settings: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
};

export const adminLinks: { href: string; label: string; icon: keyof typeof icons }[] = [
  { href: "/", label: "Overview", icon: "overview" },
  { href: "/dispatch", label: "Dispatch", icon: "dispatch" },
  { href: "/rides", label: "Rides", icon: "rides" },
  { href: "/live", label: "Live map", icon: "live" },
  { href: "/users", label: "All users", icon: "users" },
  { href: "/passengers", label: "Passengers", icon: "passengers" },
  { href: "/drivers", label: "Drivers", icon: "drivers" },
  { href: "/payments", label: "Payments", icon: "payments" },
  { href: "/pricing", label: "Pricing", icon: "pricing" },
  { href: "/reports", label: "Reports", icon: "reports" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-[#E5E7EB] px-5 py-5">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#B8D83A] text-sm font-extrabold text-[#1A1A1A]">
          FN
        </div>
        <p className="text-lg font-extrabold tracking-tight text-[#1A1A1A]">Fife Nearby Taxis</p>
        <p className="text-xs text-[#6B7280]">Admin console</p>
        <div className="mt-4 rounded-xl border border-[#8FBF1F]/35 bg-[#F4F9D8] px-3 py-2">
          <p className="text-sm font-semibold text-[#1A1A1A]">Live mock data</p>
          <p className="text-xs text-[#6B7280]">Interactive · no login</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
        {adminLinks.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-[#2563EB] text-white"
                  : "text-[#6B7280] hover:bg-[#F4F9D8] hover:text-[#1A1A1A]"
              }`}
            >
              <Icon>{icons[l.icon]}</Icon>
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-white">
            OA
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1A1A1A]">Ops Admin</p>
            <p className="truncate text-xs text-[#6B7280]">ops@demo.local</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Desktop fixed sidebar — never drifts when page scrolls */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-hidden border-r border-[#E5E7EB] bg-white lg:flex">
      <SidebarNav />
    </aside>
  );
}
