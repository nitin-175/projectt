import { NavLink, Outlet } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";

export function AdminLayout() {
  const sessionRoles = useSessionStore((state) => state.roles);
  const userName = useSessionStore((state) => state.userName);
  const isAdmin = sessionRoles.includes("ADMIN");
  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: "M3.75 12h7.5V4.5h-7.5V12zm9 7.5h7.5V4.5h-7.5v15zm-9 0h7.5V13.5h-7.5v6z" },
    { to: "/admin/shows", label: "Shows", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
    ...(isAdmin
      ? [{ to: "/admin/venues", label: "Venues", icon: "M3.75 19.5h16.5M5.25 19.5V8.25l7.5-4.5 7.5 4.5V19.5M9 9.75h.008v.008H9V9.75zm0 3h.008v.008H9v-.008zm0 3h.008v.008H9v-.008zm3-3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm3-6h.008v.008H15V9.75zm0 3h.008v.008H15v-.008zm0 3h.008v.008H15v-.008z" }]
      : []),
    ...(isAdmin
      ? [{ to: "/admin/users", label: "Users", icon: "M15 19.128a9.38 9.38 0 00-3-.478 9.38 9.38 0 00-3 .478M15 19.128a3 3 0 110-6.256M9 19.128a3 3 0 100-6.256M15 19.128v.372A2.25 2.25 0 0112.75 21h-1.5A2.25 2.25 0 019 19.5v-.372M12 12.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" }]
      : []),
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="lg:flex lg:min-h-screen">
        <aside className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,16,30,0.98),rgba(4,10,20,0.94))] px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:h-screen lg:w-[320px] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-6 lg:py-6 lg:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur lg:rounded-[32px] lg:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#2dd4bf,#2563eb)] shadow-[0_14px_30px_rgba(37,99,235,0.35)]">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 17.25V6.75A2.25 2.25 0 016.75 4.5h10.5A2.25 2.25 0 0119.5 6.75v10.5A2.25 2.25 0 0117.25 19.5H6.75A2.25 2.25 0 014.5 17.25zm4.5-7.5h6m-6 4.5h6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300/80">Premium Control</p>
                <p className="font-display text-3xl font-black leading-none">StagePass HQ</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Signed in</p>
                <p className="mt-1 truncate text-sm font-bold text-white">{userName ?? "Team Member"}</p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                Live
              </span>
            </div>
          </div>

          <nav className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:mt-8 lg:grid-cols-1 lg:space-y-2">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/admin"}
                className={({ isActive }) =>
                  `group flex min-w-0 items-center gap-3 rounded-[22px] border px-4 py-4 transition-all duration-300 lg:gap-4 lg:rounded-[24px] lg:px-5 ${
                    isActive
                      ? "border-cyan-400/30 bg-cyan-400/10 text-white shadow-[0_18px_40px_rgba(34,211,238,0.12)]"
                      : "border-transparent bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.06]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${isActive ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200" : "border-white/10 bg-white/5 text-slate-400 group-hover:text-white"}`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={link.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black uppercase tracking-[0.2em] lg:tracking-[0.25em]">{link.label}</p>
                    </div>
                    <div className={`hidden h-2.5 w-2.5 rounded-full transition-all lg:block ${isActive ? "bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.8)]" : "bg-transparent"}`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 grid gap-4 pb-2 lg:border-t lg:border-white/10 lg:pt-6">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">System status</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.8)]" />
                <span className="text-sm font-semibold text-slate-200">Operations running smoothly</span>
              </div>
            </div>
            <NavLink
              to="/"
              className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold uppercase tracking-[0.2em] text-slate-200 transition-colors hover:bg-white/10"
            >
              Return to site
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.5 6L4.5 12m0 0l6 6m-6-6h15" />
              </svg>
            </NavLink>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top,#16324f_0%,#09111d_38%,#050a13_100%)] px-4 py-4 sm:px-6 sm:py-6 md:px-8 xl:px-10 lg:ml-[320px]">
          <div className="mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:p-6 md:rounded-[36px] md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
