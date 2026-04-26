import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ShowSummary } from "@show-booking/types";
import { formatCurrency } from "@show-booking/utils";
import { PosterArtwork } from "../components/PosterArtwork";
import { SectionHeader } from "../components/SectionHeader";
import { getShowById } from "../services/showService";
import { useSessionStore } from "../store/sessionStore";

export function ShowDetailsPage() {
  const { showId } = useParams();
  const roles = useSessionStore((state) => state.roles);
  const [show, setShow] = useState<ShowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canBookShows = !roles.includes("ADMIN") && !roles.includes("ORGANIZER");
  const now = Date.now();

  useEffect(() => {
    if (!showId) {
      setLoading(false);
      setError("Show id is missing.");
      return;
    }

    void getShowById(Number(showId))
      .then(setShow)
      .catch(() => setError("Unable to load show details."))
      .finally(() => setLoading(false));
  }, [showId]);

  return (
    <div className="space-y-16">
      <SectionHeader
        eyebrow="Exclusive Access"
        title={show?.title ?? "Show Spotlight"}
        description={show?.description ?? "Discover the details of this exceptional performance."}
      />

      {loading && (
        <div className="grid gap-12 animate-pulse lg:grid-cols-2">
          <div className="h-[600px] rounded-[40px] border border-surface-200 bg-white" />
          <div className="h-[600px] rounded-[40px] border border-surface-200 bg-white" />
        </div>
      )}

      {error && (
        <div className="rounded-[40px] border border-red-100 bg-red-50 p-16 text-center">
          <p className="text-xl font-bold text-red-600">{error}</p>
          <Link to="/shows" className="mt-8 inline-block btn-secondary">Back to Collection</Link>
        </div>
      )}

      {show && !loading && (
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative overflow-hidden rounded-[40px] bg-premium p-12 text-white shadow-premium">
            <div className="absolute inset-0 opacity-20">
              <PosterArtwork
                title={show.title}
                posterUrl={show.posterUrl}
                className="h-full w-full"
                imageClassName="h-full w-full object-cover"
                fallbackClassName="flex h-full w-full items-center justify-center bg-transparent p-10"
                titleClassName="text-center font-display text-6xl font-black uppercase tracking-tight text-white/10"
              />
            </div>
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px]" />
            <span className="relative z-10 rounded-full border border-brand-600/30 bg-brand-600/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-400">
              {show.genre}
            </span>
            <h2 className="relative z-10 mt-8 font-display text-5xl font-black leading-tight">
              {show.title}
            </h2>
            <div className="relative z-10 mt-12 space-y-8">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Duration</span>
                  <span className="text-xl font-bold text-white">{show.durationMinutes} minutes</span>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Language</span>
                  <span className="text-xl font-bold text-white">{show.language}</span>
                </div>
              </div>
              <p className="text-lg leading-relaxed text-slate-300">
                {show.description}
              </p>
            </div>
            <div className="mt-16 h-px w-full bg-gradient-to-r from-white/20 to-transparent" />
            <div className="mt-8 flex items-center gap-4">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Availability</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[40px] border border-surface-200 bg-white p-10 shadow-premium">
              <h3 className="font-display text-3xl font-black text-premium">Select Perspective</h3>
              <p className="mt-2 text-slate-500">
                {canBookShows ? "Pick a timing that fits your schedule." : "Admin and organizer accounts can manage shows, but they cannot book them."}
              </p>

              <div className="mt-10 space-y-4">
                {show.timings?.map((timing) => {
                  const isPastTiming = new Date(timing.startTime).getTime() <= now;

                  return (
                    <div
                      key={timing.id}
                      className={`group relative flex flex-wrap items-center justify-between gap-6 rounded-3xl border p-6 transition-all duration-300 ${
                        isPastTiming
                          ? "border-slate-200 bg-slate-50/70"
                          : "border-surface-200 bg-surface-50 hover:border-brand-500 hover:bg-white hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`flex h-16 w-16 flex-col items-center justify-center rounded-2xl border shadow-sm transition-colors ${
                          isPastTiming
                            ? "border-slate-200 bg-slate-100"
                            : "border-surface-200 bg-white group-hover:border-brand-100 group-hover:bg-brand-50"
                        }`}>
                          <p className={`text-[10px] font-bold uppercase ${isPastTiming ? "text-slate-400" : "text-slate-400 group-hover:text-brand-600"}`}>
                            {new Date(timing.startTime).toLocaleString("default", { month: "short" })}
                          </p>
                          <p className="text-xl font-bold text-premium">{new Date(timing.startTime).getDate()}</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-premium">
                            {new Date(timing.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-sm font-medium text-slate-400">
                            {timing.venueName} | {timing.screenName}
                          </p>
                          {isPastTiming ? (
                            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-red-500">
                              Past show
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="text-xl font-black text-brand-600">{formatCurrency(timing.price)}</p>
                        {canBookShows && !isPastTiming ? (
                          <Link
                            to={`/shows/${show.id}/seats?timingId=${timing.id}`}
                            className="btn-premium !px-6 !py-3"
                          >
                            Reserve Spot
                          </Link>
                        ) : (
                          <span className="rounded-full border border-surface-200 bg-surface-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                            {isPastTiming ? "Unavailable" : "Booking disabled"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {show.timings?.length === 0 && (
                  <div className="rounded-3xl border-2 border-dashed border-surface-200 py-12 text-center">
                    <p className="font-medium text-slate-400">Currently no upcoming schedules for this selection.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
