import { useEffect, useMemo, useState } from "react";
import type { SeatMapItem, ShowSummary, ShowTimingSummary } from "@show-booking/types";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { formatCurrency } from "@show-booking/utils";
import { getSeats } from "../services/seatService";
import { getShowById } from "../services/showService";
import { useBookingStore } from "../store/bookingStore";
import { useSessionStore } from "../store/sessionStore";

export function SeatSelectionPage() {
  const navigate = useNavigate();
  const { showId } = useParams();
  const [searchParams] = useSearchParams();
  const timingId = Number(searchParams.get("timingId"));
  const setDraft = useBookingStore((state) => state.setDraft);
  const roles = useSessionStore((state) => state.roles);
  const [show, setShow] = useState<ShowSummary | null>(null);
  const [seats, setSeats] = useState<SeatMapItem[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canBookShows = !roles.includes("ADMIN") && !roles.includes("ORGANIZER");

  useEffect(() => {
    if (!timingId || !showId) {
      setLoading(false);
      setError("Missing show timing. Please choose a show time first.");
      return;
    }

    setLoading(true);
    Promise.all([getShowById(Number(showId)), getSeats(timingId)])
      .then(([showResponse, seatsResponse]) => {
        setShow(showResponse);
        setSeats(seatsResponse);
      })
      .catch(() => setError("Unable to load seats for this show timing."))
      .finally(() => setLoading(false));
  }, [showId, timingId]);

  const selectedTiming = useMemo<ShowTimingSummary | undefined>(
    () => show?.timings?.find((timing) => timing.id === timingId),
    [show, timingId],
  );

  const seatRows = useMemo(() => {
    const rows = new Map<string, SeatMapItem[]>();
    seats.forEach((seat) => {
      const rowKey = seat.label.charAt(0);
      rows.set(rowKey, [...(rows.get(rowKey) ?? []), seat]);
    });
    return Array.from(rows.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedSeatIds.includes(seat.id)),
    [seats, selectedSeatIds],
  );

  function toggleSeat(seatId: number) {
    setSelectedSeatIds((current) =>
      current.includes(seatId) ? current.filter((id) => id !== seatId) : [...current, seatId],
    );
  }

  function continueToCheckout() {
    if (!show || !selectedTiming || selectedSeats.length === 0 || !canBookShows) {
      return;
    }

    setDraft({
      showId: show.id,
      showTitle: show.title,
      showTimingId: selectedTiming.id,
      timing: selectedTiming,
      seats: selectedSeats.map((seat) => ({ id: seat.id, label: seat.label })),
    });

    navigate("/checkout");
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-600 mb-2">Seating Chart</p>
          <h1 className="font-display text-4xl lg:text-5xl font-black text-premium">Pick your perspective.</h1>
        </div>
        {selectedTiming && (
           <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date & Time</span>
                <span className="text-sm font-bold text-premium">{new Date(selectedTiming.startTime).toLocaleString()}</span>
              </div>
              <div className="h-8 w-px bg-surface-100" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unit Price</span>
                <span className="text-sm font-bold text-brand-600">{formatCurrency(selectedTiming.price)}</span>
              </div>
           </div>
        )}
      </div>

      {loading && (
        <div className="rounded-[40px] border border-surface-200 bg-white p-12 text-center animate-pulse">
           <p className="text-slate-400 font-medium">Calibrating seat availability...</p>
        </div>
      )}

      {error && (
        <div className="rounded-[40px] border border-red-100 bg-red-50 p-12 text-center">
            <p className="text-lg font-bold text-red-600">{error}</p>
            <Link to="/shows" className="mt-6 btn-secondary inline-block">Back to Selection</Link>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-12 lg:grid-cols-[1fr_0.4fr]">
          <div className="rounded-[40px] border border-surface-200 bg-white p-12 shadow-premium">
            <div className="mx-auto max-w-2xl">
              <div className="relative mb-20 text-center">
                <div className="absolute inset-x-0 -top-4 h-24 bg-gradient-to-b from-brand-500/10 to-transparent blur-2xl" />
                <div className="relative rounded-2xl border-2 border-surface-200 bg-surface-50 py-4 text-[10px] font-black tracking-[0.5em] text-slate-400 uppercase">
                  Focal Point / Stage
                </div>
              </div>

              <div className="grid gap-6">
                {seatRows.map(([row, rowSeats]) => (
                  <div key={row} className="flex items-center gap-4">
                    <span className="w-8 text-xs font-black text-slate-300">{row}</span>
                    <div className="flex-1 flex justify-center gap-3">
                      {rowSeats.map((seat) => {
                        const isBooked = seat.status === "BOOKED";
                        const isSelected = selectedSeatIds.includes(seat.id);
                        return (
                          <button
                            key={seat.id}
                            type="button"
                            disabled={isBooked}
                            onClick={() => toggleSeat(seat.id)}
                            className={`h-10 w-10 md:h-12 md:w-12 rounded-xl text-[10px] font-bold transition-all duration-300 ${
                              isBooked
                                ? "cursor-not-allowed bg-surface-100 text-slate-300 border border-surface-200 opacity-50"
                                : isSelected
                                  ? "bg-premium text-white shadow-lg shadow-premium/30 border-2 border-premium scale-110"
                                  : "bg-surface-50 text-slate-500 border border-surface-200 hover:border-brand-500 hover:text-brand-600 hover:bg-white hover:scale-105"
                            }`}
                          >
                            {seat.label.replace(row, '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-20 flex justify-center gap-8 border-t border-surface-100 pt-10">
                 <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-md bg-surface-50 border border-surface-200" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-md bg-premium shadow-sm" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-md bg-surface-100 border border-surface-200 opacity-50" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reserved</span>
                 </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
             <div className="sticky top-24 rounded-[40px] border border-surface-200 bg-white p-8 shadow-premium">
                <h3 className="font-display text-2xl font-black text-premium">Your Selection</h3>
                {!canBookShows ? (
                  <div className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
                    Admin and organizer accounts can review seat layouts, but only customer accounts can continue to checkout.
                  </div>
                ) : null}
                {selectedSeats.length > 0 ? (
                  <div className="mt-8 space-y-6">
                    <div className="space-y-3">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chosen Seats</span>
                       <div className="flex flex-wrap gap-2">
                          {selectedSeats.map(seat => (
                            <span key={seat.id} className="rounded-lg bg-surface-100 px-3 py-1.5 text-sm font-bold text-premium animate-in zoom-in-50">
                              {seat.label}
                            </span>
                          ))}
                       </div>
                    </div>
                    <div className="border-t border-surface-100 pt-6">
                       <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Investment</span>
                             <span className="text-3xl font-black text-brand-600">{formatCurrency(selectedTiming!.price * selectedSeats.length)}</span>
                          </div>
                       </div>
                    </div>
                    <button
                      type="button"
                      onClick={continueToCheckout}
                      disabled={!canBookShows}
                      className="btn-premium w-full mt-4"
                    >
                      Authenticate Booking
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 py-12 text-center border-t border-surface-100">
                    <p className="text-sm font-medium text-slate-400">Please select at least one seat to proceed.</p>
                  </div>
                )}
             </div>
          </aside>
        </div>
      )}
    </div>
  );
}
