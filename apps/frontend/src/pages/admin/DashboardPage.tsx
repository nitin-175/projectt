import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import { formatCurrency } from "@show-booking/utils";
import type { DashboardSummary } from "@show-booking/types";
import { getDashboardSummary } from "../../services/dashboardService";
import { useSessionStore } from "../../store/sessionStore";

type DashboardCard = {
  label: string;
  value: string;
  helper: string;
  to: string;
  accent: string;
};

export function DashboardPage() {
  const roles = useSessionStore((state) => state.roles);
  const isAdmin = roles.includes("ADMIN");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getDashboardSummary()
      .then(setSummary)
      .catch((requestError: unknown) => {
        if (requestError instanceof AxiosError) {
          const apiError = requestError.response?.data;
          if (typeof apiError?.error === "string" && apiError.error.trim().length > 0) {
            setError(apiError.error);
            return;
          }
        }
        setError("Unable to load dashboard insights right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo<DashboardCard[]>(() => {
    if (!summary) {
      return [];
    }

    if (isAdmin) {
      return [
        {
          label: "Registered Users",
          value: summary.registeredUsers.toLocaleString(),
          helper: "Total accounts currently registered on the platform.",
          to: "/admin/users",
          accent: "from-cyan-400/30 to-blue-500/10",
        },
        {
          label: "Active Organizers",
          value: summary.activeOrganizers.toLocaleString(),
          helper: "Organizer accounts available to manage venues and shows.",
          to: "/admin/users",
          accent: "from-emerald-400/30 to-teal-500/10",
        },
        {
          label: "Venues",
          value: summary.venueCount.toLocaleString(),
          helper: "Live venue locations configured in the system.",
          to: "/admin/venues",
          accent: "from-amber-400/30 to-orange-500/10",
        },
        {
          label: "Published Shows",
          value: summary.showCount.toLocaleString(),
          helper: "Shows currently available to manage across venues.",
          to: "/admin/shows",
          accent: "from-fuchsia-400/30 to-indigo-500/10",
        },
        {
          label: "Confirmed Bookings",
          value: summary.confirmedBookings.toLocaleString(),
          helper: `${summary.soldSeatCount.toLocaleString()} seats sold through successful checkouts.`,
          to: "/admin",
          accent: "from-sky-400/30 to-cyan-500/10",
        },
        {
          label: "Revenue",
          value: formatCurrency(summary.totalRevenue),
          helper: `${summary.pendingBookings.toLocaleString()} checkouts still waiting for payment completion.`,
          to: "/admin",
          accent: "from-violet-400/30 to-blue-500/10",
        },
      ];
    }

    return [
      {
        label: "Customers Reached",
        value: summary.trackedCustomers.toLocaleString(),
        helper: "Unique customers who have booked your venue inventory.",
        to: "/admin",
        accent: "from-cyan-400/30 to-blue-500/10",
      },
      {
        label: "Assigned Venues",
        value: summary.venueCount.toLocaleString(),
        helper: "Venues currently assigned to your organizer account.",
        to: "/admin/shows",
        accent: "from-amber-400/30 to-orange-500/10",
      },
      {
        label: "Managed Shows",
        value: summary.showCount.toLocaleString(),
        helper: "Shows you can edit and schedule right now.",
        to: "/admin/shows",
        accent: "from-fuchsia-400/30 to-indigo-500/10",
      },
      {
        label: "Upcoming Schedules",
        value: summary.upcomingScheduleCount.toLocaleString(),
        helper: "Future show timings currently open for booking.",
        to: "/admin/shows",
        accent: "from-emerald-400/30 to-teal-500/10",
      },
      {
        label: "Confirmed Bookings",
        value: summary.confirmedBookings.toLocaleString(),
        helper: `${summary.soldSeatCount.toLocaleString()} seats sold across your shows.`,
        to: "/admin",
        accent: "from-sky-400/30 to-cyan-500/10",
      },
      {
        label: "Revenue",
        value: formatCurrency(summary.totalRevenue),
        helper: `${summary.pendingBookings.toLocaleString()} bookings are still pending payment.`,
        to: "/admin",
        accent: "from-violet-400/30 to-blue-500/10",
      },
    ];
  }, [isAdmin, summary]);

  const quickLinks = isAdmin
    ? [
        { to: "/admin/users", label: "Manage users", helper: "Create accounts, assign roles, and attach venues." },
        { to: "/admin/venues", label: "Manage venues", helper: "Add new venue locations and keep inventory current." },
        { to: "/admin/shows", label: "Manage shows", helper: "Update listings, schedules, and poster assets." },
      ]
    : [
        { to: "/admin/shows", label: "Manage shows", helper: "Create and update shows for your assigned venues." },
        { to: "/admin/shows", label: "Update schedules", helper: "Keep upcoming timings accurate for customers." },
        { to: "/", label: "View storefront", helper: "Check how your shows appear to customers on the site." },
      ];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(6,18,36,0.92),rgba(11,33,61,0.82))] p-8 shadow-[0_30px_80px_rgba(2,8,23,0.45)]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-300/80">
              {isAdmin ? "Platform Intelligence" : "Organizer Intelligence"}
            </p>
            <h1 className="mt-4 font-display text-5xl font-black leading-tight text-white md:text-6xl">
              {isAdmin ? "Premium command center" : "Venue performance suite"}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              {isAdmin
                ? "Live platform totals for users, venues, shows, bookings, and revenue in one cleaner executive dashboard."
                : "Live performance metrics focused on the venues and shows attached to your organizer account."}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Dashboard mode</p>
              <p className="mt-3 text-2xl font-black text-white">{isAdmin ? "Admin" : "Organizer"}</p>
              <p className="mt-2 text-sm text-slate-300">Connected to live backend totals and recent booking activity.</p>
            </div>
            <div className="rounded-[28px] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-200/80">System health</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
                <p className="text-lg font-black text-white">Live data connected</p>
              </div>
              <p className="mt-2 text-sm text-emerald-100/80">Metrics are streaming from the current platform dataset.</p>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="grid gap-6 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-[30px] border border-white/10 bg-white/[0.04]" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-[28px] border border-red-400/20 bg-red-400/10 p-6 text-sm font-bold text-red-100">
          {error}
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <section className="grid gap-6 xl:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.05] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${card.accent} blur-2xl transition-opacity group-hover:opacity-100`} />
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                  <h2 className="mt-4 font-display text-4xl font-black text-white">{card.value}</h2>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{card.helper}</p>
                </div>
              </Link>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Recent booking activity</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {isAdmin
                      ? "Latest bookings across the entire platform."
                      : "Latest bookings connected to your assigned venues."}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200">
                  {summary.totalBookings.toLocaleString()} total bookings
                </div>
              </div>

              {summary.recentBookings.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 p-10 text-center text-sm text-slate-400">
                  No booking activity yet for this dashboard scope.
                </div>
              ) : (
                <div className="space-y-4">
                  {summary.recentBookings.map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="rounded-[24px] border border-white/10 bg-black/15 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-black text-white">{booking.showTitle}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            #{booking.bookingId} by {booking.customerName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-cyan-200">{formatCurrency(booking.totalAmount)}</p>
                          <p className="mt-1 text-xs text-slate-500">{new Date(booking.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                          Booking {booking.bookingStatus}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                          Payment {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Operations snapshot</h3>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
                    Live
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  <SnapshotRow label="Upcoming schedules" value={summary.upcomingScheduleCount.toLocaleString()} />
                  <SnapshotRow label="Pending payments" value={summary.pendingBookings.toLocaleString()} />
                  <SnapshotRow label="Customers reached" value={summary.trackedCustomers.toLocaleString()} />
                  <SnapshotRow label="Seats sold" value={summary.soldSeatCount.toLocaleString()} />
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Quick actions</h3>
                <div className="mt-5 space-y-4">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="block rounded-[22px] border border-white/10 bg-black/15 px-5 py-4 transition-colors hover:border-white/20 hover:bg-black/20"
                    >
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-white">{link.label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{link.helper}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-black/10 px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-sm font-black uppercase tracking-[0.15em] text-white">{value}</span>
    </div>
  );
}
