import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { formatCurrency } from "@show-booking/utils";
import { createBooking } from "../services/bookingService";
import { simulatePayment } from "../services/paymentService";
import { useBookingStore } from "../store/bookingStore";

const paymentOptions = [
  { value: "CARD", label: "Credit/Debit Card", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { value: "UPI", label: "Instant UPI", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { value: "NET_BANKING", label: "Net Banking", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { draft, clearDraft } = useBookingStore();
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [outcome, setOutcome] = useState<"SUCCESS" | "FAILED">("SUCCESS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ transactionId: string; paymentStatus: string; bookingStatus: string } | null>(null);

  const totalAmount = useMemo(() => {
    if (!draft) {
      return 0;
    }
    return draft.timing.price * draft.seats.length;
  }, [draft]);

  if (!draft) {
    return <Navigate to="/shows" replace />;
  }

  const activeDraft = draft;

  useEffect(() => {
    return () => {
      if (receipt?.paymentStatus === "SUCCESS") {
        clearDraft();
      }
    };
  }, [receipt, clearDraft]);

  async function handlePayment() {
    setLoading(true);
    setError(null);

    try {
      const booking = await createBooking({
        showTimingId: activeDraft.showTimingId,
        seatIds: activeDraft.seats.map((seat) => seat.id),
      });

      const payment = await simulatePayment({
        bookingId: booking.id,
        paymentMethod,
        outcome,
      });

      setReceipt({
        transactionId: payment.transactionId,
        paymentStatus: payment.paymentStatus,
        bookingStatus: payment.bookingStatus,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data;
        if (typeof apiError?.error === "string" && apiError.error.trim().length > 0) {
          setError(apiError.error);
        } else if (error.response?.status === 403) {
          setError("Your account is not allowed to complete checkout.");
        } else {
          setError("Unable to complete checkout. Please try again.");
        }
      } else {
        setError("Unable to complete checkout. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.45fr]">
        <div className="space-y-12">
           <div className="overflow-hidden rounded-[40px] border border-surface-200 bg-white shadow-premium">
              <div className="bg-premium p-10 text-white">
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-400">Transaction Gateway</p>
                 <h1 className="mt-2 font-display text-3xl font-black">Finalize Booking</h1>
              </div>
              <div className="p-10 space-y-10">
                 <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Payment Architecture</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                       {paymentOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setPaymentMethod(option.value)}
                            className={`flex flex-col items-center gap-4 rounded-[28px] border-2 p-6 transition-all duration-300 ${
                              paymentMethod === option.value 
                                ? "border-brand-500 bg-brand-50/50 text-brand-600 shadow-sm shadow-brand-500/10" 
                                : "border-surface-100 bg-white text-slate-500 hover:border-surface-200"
                            }`}
                          >
                            <svg className={`h-6 w-6 ${paymentMethod === option.value ? "text-brand-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wider">{option.label}</span>
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 border-t border-surface-100 pt-10">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Internal Simulation Mock</h3>
                   <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setOutcome("SUCCESS")}
                        className={`flex-1 rounded-2xl border-2 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                          outcome === "SUCCESS" ? "border-green-500 bg-green-50 text-green-600" : "border-surface-100 text-slate-400"
                        }`}
                      >
                        Success Trace
                      </button>
                      <button
                        type="button"
                        onClick={() => setOutcome("FAILED")}
                        className={`flex-1 rounded-2xl border-2 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                          outcome === "FAILED" ? "border-red-500 bg-red-50 text-red-600" : "border-surface-100 text-slate-400"
                        }`}
                      >
                        Failure Trace
                      </button>
                   </div>
                 </div>

                 {error && (
                    <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-600">
                       {error}
                    </div>
                 )}

                 {receipt ? (
                    <div className="rounded-[32px] bg-surface-50 border border-brand-100 p-8 space-y-6">
                       <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Transaction ID</p>
                            <p className="font-mono text-sm font-bold text-premium">{receipt.transactionId}</p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${receipt.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {receipt.paymentStatus}
                          </div>
                       </div>
                       <div className="flex flex-col gap-4 border-t border-brand-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                          <p className="max-w-xl text-sm font-medium text-slate-500">The credentials for this show have been securely synchronized with your profile.</p>
                          <button
                            type="button"
                            onClick={() => {
                              clearDraft();
                              navigate("/bookings");
                            }}
                            className="btn-premium inline-flex items-center justify-center whitespace-nowrap text-center"
                          >
                            Explore Reservations
                          </button>
                       </div>
                    </div>
                 ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handlePayment}
                      className="btn-premium w-full !py-5 text-base"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-3">
                           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                           <span>Synchronizing Transaction...</span>
                        </div>
                      ) : "Confirm & Secure Seats"}
                    </button>
                 )}
              </div>
           </div>
        </div>

        <aside className="space-y-8">
           <div className="rounded-[40px] border border-surface-200 bg-white p-8 shadow-premium sticky top-24">
              <h3 className="font-display text-2xl font-black text-premium">Verification</h3>
              <div className="mt-8 space-y-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Performance</p>
                    <p className="font-bold text-premium">{draft.showTitle}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Venue / Perspective</p>
                    <p className="text-sm font-medium text-premium">{draft.timing.venueName} • {draft.timing.screenName}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Allocated Seats</p>
                    <p className="text-sm font-bold text-premium">{draft.seats.map(s => s.label).join(", ")}</p>
                 </div>

                 <div className="border-t border-surface-100 pt-6">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-400">
                       <span>Entrance Fee (x{draft.seats.length})</span>
                       <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-sm font-medium text-slate-400">
                       <span>Service Synchronization</span>
                       <span className="text-green-600 uppercase tracking-widest font-black text-[10px]">Included</span>
                    </div>
                    <div className="mt-6 flex justify-between items-end border-t border-brand-100 pt-6">
                       <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Internal Balance</span>
                       <span className="text-3xl font-black text-brand-600">{formatCurrency(totalAmount)}</span>
                    </div>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

