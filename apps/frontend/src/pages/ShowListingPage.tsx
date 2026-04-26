import { useEffect, useState } from "react";
import type { ShowSummary } from "@show-booking/types";
import { SectionHeader } from "../components/SectionHeader";
import { ShowCard } from "../components/ShowCard";
import { getShows } from "../services/showService";

export function ShowListingPage() {
  const [shows, setShows] = useState<ShowSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getShows()
      .then(setShows)
      .catch(() => setError("Unable to load shows right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 lg:space-y-24">
      <SectionHeader
        eyebrow="Curated Collection"
        title="Find your next unforgettable moment."
        description="Explore our hand-picked selection of the world's most prestigious performances."
      />

      <div className="relative min-h-[400px]">
        {loading && (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 opacity-50 pointer-events-none">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[500px] rounded-[32px] bg-white border border-surface-200 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-[32px] border border-red-100 bg-red-50 p-12 text-center">
            <p className="text-lg font-bold text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 btn-secondary text-red-600 hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && shows.length === 0 && (
          <div className="rounded-[32px] border border-surface-200 bg-white p-20 text-center">
            <p className="text-xl font-bold text-premium">No shows available at this time.</p>
            <p className="mt-2 text-slate-500">Check back soon for new premium listings.</p>
          </div>
        )}

        {!loading && !error && shows.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

