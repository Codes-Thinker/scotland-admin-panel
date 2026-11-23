"use client";

import { Shell } from "@/components/Shell";
import { UsersPanel } from "@/components/users-panel";

export default function UsersPage() {
  return (
    <Shell title="All users" subtitle="Passengers, drivers and operations accounts" status="Live data from the operations API">
      <UsersPanel />
    </Shell>
  );
}
