import type { ShowSummary } from "@show-booking/types";
import { Link } from "react-router-dom";
import { PosterArtwork } from "./PosterArtwork";

type ShowCardProps = {
  show: ShowSummary;
};

export function ShowCard({ show }: ShowCardProps) {
  const getGenreStyles = (genre: string) => {
    switch (genre.toLowerCase()) {
      case "thriller": return "text-accent-rose bg-rose-50 border-rose-100 group-hover:border-rose-300";
      case "musical": return "text-premium-royal bg-indigo-50 border-indigo-100 group-hover:border-indigo-300";
      case "jazz": return "text-orange-600 bg-orange-50 border-orange-100 group-hover:border-orange-300";
      case "opera": return "text-accent-emerald bg-emerald-50 border-emerald-100 group-hover:border-emerald-300";
      case "theater": return "text-accent-gold bg-amber-50 border-amber-100 group-hover:border-amber-300";
      default: return "text-premium bg-surface-50 border-surface-200 group-hover:border-brand-300";
    }
  };

  const genreStyles = getGenreStyles(show.genre);

  return (
    <article className="group overflow-hidden rounded-[40px] border border-surface-200 bg-white transition-all duration-700 hover:-translate-y-2 hover:border-transparent hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)]">
      <div className="relative h-72 overflow-hidden bg-surface-100">
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-premium/40 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute left-6 top-6 z-20">
          <span className={`rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border ${genreStyles}`}>
            {show.genre}
          </span>
        </div>

        <PosterArtwork
          title={show.title}
          posterUrl={show.posterUrl}
          className="h-full w-full"
          imageClassName="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110"
          fallbackClassName="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-100 to-surface-200 p-12 transition-all duration-1000 group-hover:scale-110"
          titleClassName="relative flex h-full w-full items-center justify-center rounded-3xl border-2 border-dashed border-slate-300/30 bg-white/5 px-4 text-center font-display text-4xl font-black uppercase tracking-tighter text-slate-300 transition-all duration-700 group-hover:text-brand-500/20"
        />
      </div>

      <div className="p-8">
        <h3 className="font-display text-2xl font-bold tracking-tight text-premium group-hover:text-brand-600 transition-colors">
          {show.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
          {show.description}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duration</span>
            <span className="text-sm font-bold text-premium">{show.durationMinutes} mins</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Language</span>
            <span className="text-sm font-bold text-premium">{show.language}</span>
          </div>
        </div>
        <Link
          to={`/shows/${show.id}`}
          className="btn-premium mt-8 flex w-full justify-center"
        >
          Explore Details
        </Link>
      </div>
    </article>
  );
}
