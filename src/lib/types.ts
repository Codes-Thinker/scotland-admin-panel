export type UserRole = "Passenger" | "Driver" | "Admin";
export type AccountStatus = "Active" | "Pending" | "Suspended";
export type RideStatus = "Queued" | "Dispatched" | "Active" | "Completed" | "Cancelled";
export type RideType = "Standard" | "Emergency" | "Scheduled" | "Roadside";
export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";
export type OnlineStatus = "Online" | "Offline" | "On trip";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  joined: string;
  trips: number;
};

export type Driver = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: OnlineStatus;
  rating: number;
  rides: number;
  docs: "Verified" | "Pending" | "Expired";
  vehicle: string;
  plate: string;
  zone: string;
  earnings: number;
};

export type Ride = {
  id: string;
  passenger: string;
  passengerId: string;
  driver: string;
  driverId: string;
  pickup: string;
  destination: string;
  type: RideType;
  fare: number;
  payment: PaymentStatus;
  status: RideStatus;
  when: string;
  distance: string;
};

export type Payment = {
  id: string;
  ref: string;
  rider: string;
  driver: string;
  amount: number;
  status: PaymentStatus;
  date: string;
  rideId: string;
};

export type DispatchJob = {
  id: string;
  rideId: string;
  passenger: string;
  pickup: string;
  destination: string;
  type: RideType;
  priority: "Normal" | "High" | "SOS";
  waitingSec: number;
  suggestedDriver: string;
};
