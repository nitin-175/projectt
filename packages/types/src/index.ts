export type AppRole = "USER" | "ADMIN" | "ORGANIZER" | "STAFF";

export type VenueSummary = {
  id: number;
  name: string;
  city: string;
  address: string;
};

export type AuthPayload = {
  token: string;
  name: string;
  email: string;
  roles: AppRole[];
  venueIds: number[];
};

export type ShowTimingSummary = {
  id: number;
  screenName: string;
  venueId: number;
  venueName: string;
  venueCity: string;
  startTime: string;
  price: number;
};

export type ShowSummary = {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  language: string;
  genre: string;
  posterUrl: string;
  venues: VenueSummary[];
  timings?: ShowTimingSummary[];
};

export type SeatMapItem = {
  id: number;
  showTimingId: number;
  label: string;
  status: "AVAILABLE" | "BOOKED";
};

export type BookingSummary = {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  showTimingId: number | null;
  showTitle: string | null;
  seatIds: number[];
  seatNumbers?: string[];
  paymentStatus: string | null;
  transactionId: string | null;
  paymentMethod: string | null;
};

export type CreateBookingRequest = {
  showTimingId: number;
  seatIds: number[];
};

export type PaymentSimulationRequest = {
  bookingId: number;
  paymentMethod: string;
  outcome: "SUCCESS" | "FAILED";
};

export type PaymentSimulationResponse = {
  bookingId: number;
  transactionId: string;
  paymentStatus: "SUCCESS" | "FAILED";
  bookingStatus: "CONFIRMED" | "FAILED";
  paymentMethod: string;
};

export type DashboardRecentBooking = {
  bookingId: number;
  customerName: string;
  showTitle: string;
  bookingStatus: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
};

export type DashboardSummary = {
  scope: "ADMIN" | "ORGANIZER";
  registeredUsers: number;
  activeOrganizers: number;
  trackedCustomers: number;
  venueCount: number;
  showCount: number;
  upcomingScheduleCount: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  soldSeatCount: number;
  totalRevenue: number;
  recentBookings: DashboardRecentBooking[];
};
