"use client";

import { Shell } from "@/components/Shell";
import { UsersPanel } from "@/components/users-panel";

export default function PassengersPage() {
  return (
    <Shell title="Passengers" subtitle="Passenger accounts and their status" status="Live data from the operations API">
      <UsersPanel fixedRole="passenger" />
    </Shell>
  );
}
