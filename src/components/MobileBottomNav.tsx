"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { adminLinks } from "./Sidebar";

const primaryHrefs = new Set(["/", "/dispatch", "/rides", "/live"]);

const primaryTabs = [
  { href: "/", label: "Home", icon: "overview" as const },
  { href: "/dispatch", label: "Dispatch", icon: "dispatch" as const },
  { href: "/rides", label: "Rides", icon: "rides" as const },
  { href: "/live", label: "Live", icon: "live" as const },
];

function TabIcon({ name, active }: { name: (typeof primaryTabs)[number]["icon"] | "more"; active: boolean }) {
  const stroke = active ? "#8FBF1F" : "#8E8E93";
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: active ? 2.25 : 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "overview") {
    return (
      <svg {...props}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill={active ? stroke : "none"} fillOpacity={active ? 0.15 : 0} />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (name === "dispatch") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="3" fill={active ? stroke : "none"} fillOpacity={active ? 0.2 : 0} />
        <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
      </svg>
    );
  }
  if (name === "rides") {
    return (
      <svg {...props}>
        <path d="M3 13h13l3-5H8L3 13Z" fill={active ? stroke : "none"} fillOpacity={active ? 0.2 : 0} />
        <path d="M5 13v4h2M14 13v4h2" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="15.5" cy="17.5" r="1.5" />
      </svg>
    );
  }
  if (name === "live") {
    return (
      <svg {...props}>
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" fill={active ? stroke : "none"} fillOpacity={active ? 0.15 : 0} />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="5" cy="12" r="1.6" fill={stroke} stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill={stroke} stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill={stroke} stroke="none" />
    </svg>
  );
}

function TabCell({
  active,
  children,
  onClick,
  href,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const className = `flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] px-1 py-1.5 transition active:scale-95 ${
    active ? "bg-white/70" : "bg-transparent"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

/** Floating pill bottom nav — WhatsApp iOS style, mobile only */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = !primaryHrefs.has(pathname);

  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const moreLinks = adminLinks.filter((l) => !primaryHrefs.has(l.href));

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close more menu"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
              <p className="text-base font-extrabold">More</p>
              <button type="button" className="btn-ghost" onClick={() => setMoreOpen(false)}>
                Done
              </button>
            </div>
            <nav className="max-h-[calc(78dvh-3.5rem)] space-y-1 overflow-y-auto overscroll-contain p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {moreLinks.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold ${
                      active ? "bg-[#F4F9D8] text-[#1A1A1A]" : "text-[#374151] hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <span>{l.label}</span>
                    {active ? <span className="text-xs font-bold text-[#8FBF1F]">Open</span> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3.5 lg:hidden"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        <nav className="pointer-events-auto mx-auto flex h-[62px] max-w-lg items-stretch rounded-[30px] border border-white/65 bg-[#F2F2F7]/90 px-1 py-1 shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
          {primaryTabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <TabCell key={tab.href} href={tab.href} active={active}>
                <TabIcon name={tab.icon} active={active} />
                <span
                  className={`text-[10px] font-semibold tracking-tight ${
                    active ? "text-[#8FBF1F]" : "text-[#8E8E93]"
                  }`}
                >
                  {tab.label}
                </span>
              </TabCell>
            );
          })}
          <TabCell active={moreActive || moreOpen} onClick={() => setMoreOpen(true)}>
            <TabIcon name="more" active={moreActive || moreOpen} />
            <span
              className={`text-[10px] font-semibold tracking-tight ${
                moreActive || moreOpen ? "text-[#8FBF1F]" : "text-[#8E8E93]"
              }`}
            >
              More
            </span>
          </TabCell>
        </nav>
      </div>
    </>
  );
}
