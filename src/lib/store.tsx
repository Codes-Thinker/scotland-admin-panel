"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  activities as seedActivities,
  dispatchQueue as seedDispatch,
  drivers as seedDrivers,
  payments as seedPayments,
  rides as seedRides,
  users as seedUsers,
} from "./mock-data";
import type { DispatchJob, Driver, Payment, Ride, User } from "./types";

type Store = {
  users: User[];
  drivers: Driver[];
  rides: Ride[];
  payments: Payment[];
  dispatchQueue: DispatchJob[];
  activities: string[];
  setUserStatus: (id: string, status: User["status"]) => void;
  setDriverStatus: (id: string, status: Driver["status"]) => void;
  setDriverDocs: (id: string, docs: Driver["docs"]) => void;
  setRideStatus: (id: string, status: Ride["status"]) => void;
  assignDriver: (rideId: string, driverName: string, driverId: string) => void;
  dispatchJob: (jobId: string, driverName: string) => void;
  markPayment: (id: string, status: Payment["status"]) => void;
  pushActivity: (text: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState(seedUsers);
  const [drivers, setDrivers] = useState(seedDrivers);
  const [rides, setRides] = useState(seedRides);
  const [payments, setPayments] = useState(seedPayments);
  const [dispatchQueue, setDispatchQueue] = useState(seedDispatch);
  const [activities, setActivities] = useState(seedActivities);

  const pushActivity = (text: string) => setActivities((a) => [text, ...a].slice(0, 12));

  const value = useMemo<Store>(
    () => ({
      users,
      drivers,
      rides,
      payments,
      dispatchQueue,
      activities,
      pushActivity,
      setUserStatus: (id, status) => {
        setUsers((list) => list.map((u) => (u.id === id ? { ...u, status } : u)));
        pushActivity(`User ${id} status → ${status}`);
      },
      setDriverStatus: (id, status) => {
        setDrivers((list) => list.map((d) => (d.id === id ? { ...d, status } : d)));
        pushActivity(`Driver ${id} → ${status}`);
      },
      setDriverDocs: (id, docs) => {
        setDrivers((list) => list.map((d) => (d.id === id ? { ...d, docs } : d)));
        pushActivity(`Driver ${id} docs → ${docs}`);
      },
      setRideStatus: (id, status) => {
        setRides((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
        pushActivity(`Ride ${id} → ${status}`);
      },
      assignDriver: (rideId, driverName, driverId) => {
        setRides((list) =>
          list.map((r) =>
            r.id === rideId
              ? { ...r, driver: driverName, driverId, status: r.status === "Queued" ? "Dispatched" : r.status }
              : r,
          ),
        );
        pushActivity(`Assigned ${driverName} to ride ${rideId}`);
      },
      dispatchJob: (jobId, driverName) => {
        const job = dispatchQueue.find((j) => j.id === jobId);
        if (!job) return;
        const driver = drivers.find((d) => d.name === driverName);
        setRides((list) =>
          list.map((r) =>
            r.id === job.rideId
              ? {
                  ...r,
                  driver: driverName,
                  driverId: driver?.id ?? "",
                  status: "Dispatched",
                }
              : r,
          ),
        );
        setDispatchQueue((q) => q.filter((j) => j.id !== jobId));
        if (driver) {
          setDrivers((list) =>
            list.map((d) => (d.id === driver.id ? { ...d, status: "On trip" } : d)),
          );
        }
        pushActivity(`Dispatched ${job.rideId} → ${driverName}`);
      },
      markPayment: (id, status) => {
        setPayments((list) => list.map((p) => (p.id === id ? { ...p, status } : p)));
        pushActivity(`Payment ${id} → ${status}`);
      },
    }),
    [users, drivers, rides, payments, dispatchQueue, activities],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}
