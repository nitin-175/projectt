import { Link } from "react-router-dom";
import { SectionHeader } from "../components/SectionHeader";
import { StatsCard } from "../components/StatsCard";
import { useSessionStore } from "../store/sessionStore";

const stats = [
  { label: "Live Productions", value: "24", helper: "Exclusive shows currently available for reservation." },
  { label: "Seat Accuracy", value: "100%", helper: "Atomic synchronization ensures zero double-bookings." },
  { label: "Global Reach", value: "12", helper: "Premium venues supported across major city hubs." },
];

export function HomePage() {
  const token = useSessionStore((state) => state.token);

  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden px-6 py-12 lg:px-12 lg:py-16 xl:px-20">
        {/* Background Decoration */}
        <div className="absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full bg-accent-royal/10 blur-[150px] animate-pulse" />
        <div className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-accent-gold/10 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-brand-500/5 to-transparent pointer-events-none" />

        <div className="relative mx-auto min-h-[calc(100vh-11rem)] max-w-[1600px] grid gap-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-brand-600">
                The Future of Experience
              </span>
              <h1 className="font-display text-7xl font-black text-premium leading-[1.1] tracking-tight">
                Reserved for those who value <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-royal to-brand-600">time and art.</span>
              </h1>
              <p className="max-w-xl text-xl text-slate-500 leading-relaxed font-medium">
                StagePass is the definitive platform for discovering and booking the world's most anticipated live events. Precision engineered for seamless discovery.
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link
                to="/shows"
                className="btn-premium py-5 px-10 text-lg group shadow-[0_20px_40px_-10px_rgba(38,101,249,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(38,101,249,0.4)]"
              >
                Explore Selected Shows
                <svg className="ml-3 inline-block w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              {token ? (
                <Link
                  to="/bookings"
                  className="btn-secondary py-5 px-10 text-lg"
                >
                  My Reservations
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="btn-secondary py-5 px-10 text-lg"
                >
                  Create Private Account
                </Link>
              )}
            </div>
            
            <div className="flex items-center gap-10 pt-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-12 w-12 rounded-full flex items-center justify-center text-xs font-black text-white ${
                    i === 1 ? 'bg-accent-royal' : i === 2 ? 'bg-accent-gold' : i === 3 ? 'bg-accent-emerald' : 'bg-accent-rose'
                  }`}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-black text-premium leading-none">
                  2.4k+ ART ENTHUSIASTS
                </p>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  Joined the elite circle this week
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-brand-600/10 to-transparent blur-2xl" />
            <div className="relative grid gap-6 sm:grid-cols-1">
              {stats.map((stat, idx) => (
                <div key={stat.label} className={`transform transition-all duration-700 hover:scale-[1.03]`} style={{ transitionDelay: `${idx * 150}ms` }}>
                  <StatsCard {...stat} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 pt-8 lg:px-12 xl:px-20">
        <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-3">
           <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-premium">Secured Payments</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Enterprise-grade encryption for every transaction with multi-layer verification.</p>
           </div>
           <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-accent-50 flex items-center justify-center text-accent-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-premium">Instant Access</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Digital passes delivered instantly to your profile with offline accessibility.</p>
           </div>
           <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-surface-100 flex items-center justify-center text-premium">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-premium">Prime Locations</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Only the most prestigious venues and carefully curated seating options.</p>
           </div>
        </div>
      </section>
    </div>
  );
}
