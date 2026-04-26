import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import type { BookingSummary } from "@show-booking/types";
import { getMyBookings } from "../services/bookingService";
import { formatCurrency } from "@show-booking/utils";
import { SectionHeader } from "../components/SectionHeader";

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getMyBookings()
      .then(setBookings)
      .catch((error: unknown) => {
        if (error instanceof AxiosError) {
          const apiError = error.response?.data;
          if (typeof apiError?.error === "string" && apiError.error.trim().length > 0) {
            setError(apiError.error);
            return;
          }
        }
        setError("Unable to load your bookings right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 lg:space-y-24">
      <SectionHeader
        eyebrow="Reservation Archives"
        title="Your journey through performance."
        description="Review your past and upcoming experiences at StagePass."
      />

      <div className="relative min-h-[400px]">
        {loading && (
          <div className="grid gap-8 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-[200px] rounded-[32px] bg-white border border-surface-200" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-[32px] border border-red-100 bg-red-50 p-12 text-center text-red-600 font-bold">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-[40px] border-2 border-dashed border-surface-200 p-20 text-center">
            <p className="text-xl font-bold text-premium">No reservations found.</p>
            <p className="mt-2 text-slate-500">Your future experiences will appear here once you secure a spot.</p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="grid gap-8">
            {bookings.map((booking) => (
              <div key={booking.id} className="group relative overflow-hidden rounded-[32px] border border-surface-200 bg-white p-8 transition-all duration-300 hover:border-brand-500 hover:shadow-premium">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-surface-50 border border-surface-100 text-premium">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order</p>
                       <p className="text-xl font-black">#{booking.id}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-premium">{booking.showTitle || "Unknown Show"}</h3>
                      <p className="text-sm font-medium text-slate-400">
                        Placed on {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {booking.status}
                  </div>
                </div>

                <div className="mt-10 grid gap-10 md:grid-cols-3 pt-8 border-t border-surface-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Allocated Seats</p>
                    <p className="text-sm font-bold text-premium">{(booking.seatNumbers ? booking.seatNumbers.join(", ") : booking.seatIds.join(", ")) || "Awaiting Finalization"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Financial Status</p>
                    <p className="text-sm font-bold text-premium">
                      {booking.paymentStatus ?? "Pending"} via {booking.paymentMethod ?? "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Transaction Value</p>
                     <p className="text-lg font-black text-brand-600">{formatCurrency(booking.totalAmount)}</p>
                  </div>
                </div>

                {booking.transactionId && (
                   <div className="mt-8 flex items-center gap-2 text-[10px] font-mono text-slate-300">
                      <span>TXN_ID:</span>
                      <span>{booking.transactionId}</span>
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

