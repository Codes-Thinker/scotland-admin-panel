"use client";

import { useState } from "react";
import { api, type Paged } from "@/lib/api";
import { runAction, useApi } from "@/lib/use-api";

export type RideStatus = "requested" | "assigned" | "arrived" | "in_progress" | "completed" | "cancelled";
export type RidePriority = "normal" | "high" | "sos";

export interface RideRow {
  id: string;
  status: RideStatus;
  rideType: "standard" | "emergency" | "roadside";
  bookingMode: "now" | "later";
  priority: RidePriority;
  pickup: { address: string };
  drop: { address: string };
  scheduledAt: string | null;
  distanceM: number | null;
  fareEstimatePence: number;
  fareFinalPence: number | null;
  requestedAt: string;
  passenger: { id: string; name: string; phone?: string };
  driver: { id: string; name: string; phone?: string } | null;
}

export interface DispatchRow extends RideRow {
  waitingSeconds: number;
  offersOpen: number;
}

export const RIDE_STATUS_LABEL: Record<RideStatus, string> = {
  requested: "Requested",
  assigned: "Assigned",
  arrived: "Arrived",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const RIDE_TYPE_LABEL: Record<RideRow["rideType"], string> = {
  standard: "Standard",
  emergency: "Emergency",
  roadside: "Roadside",
};

export function rideTypeText(r: RideRow): string {
  return r.bookingMode === "later" ? `${RIDE_TYPE_LABEL[r.rideType]} · later` : RIDE_TYPE_LABEL[r.rideType];
}

export function distanceText(m: number | null): string {
  return m ? `${(m / 1609.344).toFixed(1)} mi` : "—";
}

/** Only operations may cancel, and only before the passenger is in the car. */
export function canCancel(status: RideStatus): boolean {
  return status === "requested" || status === "assigned" || status === "arrived";
}

export function canAssign(status: RideStatus): boolean {
  return status === "requested";
}

export function rideSearchPath(params: URLSearchParams): string {
  return `/admin/rides?${params.toString()}`;
}

export interface DriverOption {
  id: string;
  name: string;
  onlineStatus: string;
  accountStatus: string;
}

/** Online, approved drivers only: the same rule the server applies when assigning. */
export function useOnlineDrivers(enabled: boolean) {
  const path = enabled
    ? "/admin/drivers?onlineStatus=online&status=active&pageSize=100"
    : null;
  return useApi<Paged<DriverOption>>(path);
}

/** Assigns a driver to a ride; returns an error message or null. */
export async function assignRide(rideId: string, driverId: string): Promise<string | null> {
  return runAction(() => api(`/admin/rides/${rideId}/assign`, { method: "POST", body: { driverId } }));
}

export async function cancelRide(rideId: string, reason: string): Promise<string | null> {
  return runAction(() => api(`/rides/${rideId}/cancel`, { method: "POST", body: { reason } }));
}

/** Select of online drivers; calls onPick with the chosen driver id. */
export function DriverPicker({
  onPick,
  disabled,
  placeholder = "Assign driver…",
}: {
  onPick: (driverId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const drivers = useOnlineDrivers(open);
  return (
    <select
      className="select max-w-full"
      defaultValue=""
      disabled={disabled}
      onFocus={() => setOpen(true)}
      onClick={() => setOpen(true)}
      onChange={(e) => {
        if (e.target.value) onPick(e.target.value);
        e.target.value = "";
      }}
    >
      <option value="">{drivers.loading ? "Loading drivers…" : placeholder}</option>
      {(drivers.data?.data ?? []).map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
      {open && drivers.data && drivers.data.data.length === 0 ? <option disabled>No drivers online</option> : null}
    </select>
  );
}
