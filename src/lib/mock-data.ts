import type { DispatchJob, Driver, Payment, Ride, User } from "./types";

export const users: User[] = [
  { id: "u1", name: "Smith", email: "smith@demo.local", phone: "+44 7700 900123", role: "Passenger", status: "Active", joined: "12/10/2026", trips: 14 },
  { id: "u2", name: "Brooke", email: "brooke@demo.local", phone: "+44 7700 900201", role: "Passenger", status: "Active", joined: "02/11/2026", trips: 6 },
  { id: "u3", name: "reece", email: "reece@demo.local", phone: "+44 7700 900202", role: "Passenger", status: "Active", joined: "05/11/2026", trips: 3 },
  { id: "u4", name: "Macnly", email: "macnly@demo.local", phone: "+44 7700 900203", role: "Passenger", status: "Suspended", joined: "01/09/2026", trips: 1 },
  { id: "u5", name: "ayaz", email: "driver@demo.local", phone: "+44 7700 900456", role: "Driver", status: "Active", joined: "01/08/2026", trips: 62 },
  { id: "u6", name: "Wadza Makore", email: "wadza@demo.local", phone: "+44 7700 900501", role: "Driver", status: "Active", joined: "15/07/2026", trips: 37 },
  { id: "u7", name: "Eugene Dhliwayo", email: "eugene@demo.local", phone: "+44 7700 900502", role: "Driver", status: "Pending", joined: "10/11/2026", trips: 14 },
  { id: "u8", name: "Glenrothes Driver", email: "glen@demo.local", phone: "+44 7700 900503", role: "Driver", status: "Active", joined: "20/06/2026", trips: 22 },
  { id: "u9", name: "Mrs", email: "mrs@demo.local", phone: "+44 7700 900204", role: "Passenger", status: "Active", joined: "18/11/2026", trips: 2 },
  { id: "u10", name: "Operations Admin", email: "ops@demo.local", phone: "+44 1500 000001", role: "Admin", status: "Active", joined: "01/01/2026", trips: 0 },
];

export const drivers: Driver[] = [
  { id: "d1", name: "Wadza Makore", email: "wadza@demo.local", phone: "+44 7700 900501", status: "Online", rating: 4.9, rides: 37, docs: "Verified", vehicle: "Toyota Prius", plate: "SF26 TAX", zone: "Levenmouth", earnings: 286.72 },
  { id: "d2", name: "Eugene Dhliwayo", email: "eugene@demo.local", phone: "+44 7700 900502", status: "Offline", rating: 4.7, rides: 14, docs: "Verified", vehicle: "Skoda Octavia", plate: "KY12 CAB", zone: "Glenrothes", earnings: 120.4 },
  { id: "d3", name: "ayaz", email: "driver@demo.local", phone: "+44 7700 900456", status: "Offline", rating: 4.5, rides: 62, docs: "Pending", vehicle: "Ford Focus", plate: "FK26 RDE", zone: "Unassigned", earnings: 410.2 },
  { id: "d4", name: "Glenrothes Driver", email: "glen@demo.local", phone: "+44 7700 900503", status: "On trip", rating: 4.6, rides: 22, docs: "Verified", vehicle: "VW Passat", plate: "CO24 FLT", zone: "Glenrothes", earnings: 198.5 },
  { id: "d5", name: "Coastal Fleet", email: "coastal@demo.local", phone: "+44 7700 900600", status: "Online", rating: 4.4, rides: 41, docs: "Verified", vehicle: "Mercedes 200", plate: "MER2001", zone: "East Fife", earnings: 305.1 },
  { id: "d6", name: "Dudu", email: "dudu@demo.local", phone: "+44 7700 900601", status: "Offline", rating: 4.2, rides: 9, docs: "Expired", vehicle: "Mazda 323", plate: "ABC1234", zone: "Kirkcaldy", earnings: 64.0 },
];

export const rides: Ride[] = [
  { id: "r1", passenger: "Smith", passengerId: "u1", driver: "Wadza Makore", driverId: "d1", pickup: "Glenrothes", destination: "Kirkcaldy", type: "Standard", fare: 12.4, payment: "Paid", status: "Completed", when: "Yesterday 18:20", distance: "7.2 mi" },
  { id: "r2", passenger: "Brooke", passengerId: "u2", driver: "Coastal Fleet", driverId: "d5", pickup: "Leven", destination: "St Andrews", type: "Scheduled", fare: 28.0, payment: "Paid", status: "Completed", when: "Mon 09:10", distance: "14.1 mi" },
  { id: "r3", passenger: "reece", passengerId: "u3", driver: "—", driverId: "", pickup: "Dunfermline", destination: "Edinburgh", type: "Emergency", fare: 0, payment: "Pending", status: "Cancelled", when: "Today 08:02", distance: "18.0 mi" },
  { id: "r4", passenger: "Smith", passengerId: "u1", driver: "ayaz", driverId: "d3", pickup: "Riverside Park", destination: "Victoria Hospital", type: "Standard", fare: 14.8, payment: "Pending", status: "Active", when: "Now", distance: "8.2 mi" },
  { id: "r5", passenger: "Mrs", passengerId: "u9", driver: "Glenrothes Driver", driverId: "d4", pickup: "Kingdom Centre", destination: "Dunfermline", type: "Standard", fare: 22.5, payment: "Paid", status: "Active", when: "Now", distance: "11.4 mi" },
  { id: "r6", passenger: "Brooke", passengerId: "u2", driver: "—", driverId: "", pickup: "Levenmouth", destination: "Glenrothes", type: "Roadside", fare: 25.0, payment: "Pending", status: "Queued", when: "Now", distance: "6.0 mi" },
  { id: "r7", passenger: "Macnly", passengerId: "u4", driver: "Eugene Dhliwayo", driverId: "d2", pickup: "Kirkcaldy", destination: "Glenrothes", type: "Standard", fare: 11.2, payment: "Failed", status: "Cancelled", when: "Sun 21:40", distance: "5.8 mi" },
  { id: "r8", passenger: "Smith", passengerId: "u1", driver: "Wadza Makore", driverId: "d1", pickup: "Home", destination: "Airport", type: "Scheduled", fare: 45.0, payment: "Pending", status: "Dispatched", when: "Tomorrow 05:30", distance: "28.0 mi" },
  { id: "r9", passenger: "reece", passengerId: "u3", driver: "Coastal Fleet", driverId: "d5", pickup: "St Andrews", destination: "Leven", type: "Standard", fare: 19.6, payment: "Paid", status: "Completed", when: "Fri 14:00", distance: "9.5 mi" },
  { id: "r10", passenger: "Mrs", passengerId: "u9", driver: "—", driverId: "", pickup: "East Fife", destination: "Dundee", type: "Emergency", fare: 36.0, payment: "Pending", status: "Queued", when: "Now", distance: "20.2 mi" },
];

export const payments: Payment[] = [
  { id: "p1", ref: "TX-10021", rider: "Smith", driver: "Wadza Makore", amount: 12.4, status: "Paid", date: "17/11/2026", rideId: "r1" },
  { id: "p2", ref: "TX-10022", rider: "Brooke", driver: "Coastal Fleet", amount: 28.0, status: "Paid", date: "16/11/2026", rideId: "r2" },
  { id: "p3", ref: "TX-10023", rider: "Smith", driver: "ayaz", amount: 14.8, status: "Pending", date: "19/11/2026", rideId: "r4" },
  { id: "p4", ref: "TX-10024", rider: "reece", driver: "Coastal Fleet", amount: 19.6, status: "Paid", date: "14/11/2026", rideId: "r9" },
  { id: "p5", ref: "TX-10025", rider: "Macnly", driver: "Eugene Dhliwayo", amount: 11.2, status: "Failed", date: "15/11/2026", rideId: "r7" },
  { id: "p6", ref: "TX-10026", rider: "Mrs", driver: "Glenrothes Driver", amount: 22.5, status: "Pending", date: "19/11/2026", rideId: "r5" },
];

export const dispatchQueue: DispatchJob[] = [
  { id: "j1", rideId: "r6", passenger: "Brooke", pickup: "Levenmouth", destination: "Glenrothes", type: "Roadside", priority: "High", waitingSec: 42, suggestedDriver: "Wadza Makore" },
  { id: "j2", rideId: "r10", passenger: "Mrs", pickup: "East Fife", destination: "Dundee", type: "Emergency", priority: "SOS", waitingSec: 18, suggestedDriver: "Coastal Fleet" },
  { id: "j3", rideId: "r8", passenger: "Smith", pickup: "Home", destination: "Airport", type: "Scheduled", priority: "Normal", waitingSec: 0, suggestedDriver: "Wadza Makore" },
];

export const pricing = [
  { type: "Standard", base: 3.78, perMile: 2.46, notes: "Mon–Fri daytime" },
  { type: "Emergency", base: 6.0, perMile: 3.1, notes: "Priority dispatch" },
  { type: "Scheduled", base: 4.5, perMile: 2.46, notes: "Book ahead" },
  { type: "Roadside", base: 25.0, perMile: 0, notes: "Assistance callout" },
];

export const activities = [
  "Ride r4 active · Smith with ayaz",
  "Dispatch queue: roadside job waiting 42s",
  "Driver Glenrothes Driver marked On trip",
  "Payment TX-10025 failed for Macnly",
  "Eugene Dhliwayo docs still Pending",
];
