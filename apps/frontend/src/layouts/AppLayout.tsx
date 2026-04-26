import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/shows", label: "Shows" },
  { to: "/bookings", label: "My Bookings" },
  { to: "/profile", label: "Profile" },
  { to: "/admin", label: "Admin" },
];

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 008 10.95c.58.1.79-.25.79-.56v-2.17c-3.25.71-3.93-1.56-3.93-1.56-.53-1.35-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.74 1.27 3.41.97.1-.76.41-1.27.74-1.56-2.59-.29-5.32-1.3-5.32-5.78 0-1.28.46-2.33 1.2-3.15-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.2a11.1 11.1 0 015.82 0c2.22-1.51 3.2-1.2 3.2-1.2.63 1.59.23 2.77.11 3.06.75.82 1.2 1.87 1.2 3.15 0 4.49-2.73 5.49-5.34 5.77.42.36.8 1.08.8 2.19v3.24c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.75A4 4 0 003.75 7.75v8.5a4 4 0 004 4h8.5a4 4 0 004-4v-8.5a4 4 0 00-4-4h-8.5zm8.88 1.37a1.13 1.13 0 110 2.26 1.13 1.13 0 010-2.26zM12 6.75A5.25 5.25 0 1112 17.25 5.25 5.25 0 0112 6.75zm0 1.75A3.5 3.5 0 1012 15.5 3.5 3.5 0 0012 8.5z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.98 3.5a1.75 1.75 0 11-.01 3.5 1.75 1.75 0 01.01-3.5zM3.5 8.75h2.96V20.5H3.5V8.75zm4.82 0h2.84v1.6h.04c.4-.75 1.37-1.85 2.83-1.85 3.03 0 3.59 1.99 3.59 4.58v7.42h-2.96v-6.58c0-1.57-.03-3.59-2.19-3.59-2.2 0-2.54 1.72-2.54 3.48v6.69H8.32V8.75z" />
      </svg>
    ),
  },
];

export function AppLayout() {
  const location = useLocation();
  const { token, userName, roles, clearSession } = useSessionStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHomePage = location.pathname === "/";

  const filteredNavItems = navItems.filter((item) => {
    if (item.to === "/bookings") {
      return !roles.includes("ADMIN") && !roles.includes("ORGANIZER");
    }
    if (item.to.startsWith("/admin")) {
      return roles.includes("ADMIN") || roles.includes("ORGANIZER");
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-50 text-premium selection:bg-brand-100 selection:text-brand-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex flex-col">
            <span className="font-display text-2xl font-extrabold tracking-tight text-premium">
              Stage<span className="text-brand-600">Pass</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Premium Experience</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-premium text-white shadow-md shadow-premium/20"
                      : "text-slate-600 hover:bg-surface-100 hover:text-premium"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            {token ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold leading-none text-premium">{userName}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{roles[0]}</p>
                </div>
                <button type="button" onClick={clearSession} className="btn-secondary !px-5 !py-2 text-xs">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-slate-600 transition-colors hover:text-premium">
                  Log in
                </Link>
                <Link to="/register" className="btn-premium !px-6 !py-2.5 text-xs">
                  Join Now
                </Link>
              </div>
            )}
          </div>

          <button
            className="p-2 text-slate-600 transition-colors hover:text-premium lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className={`bg-white transition-all duration-300 ease-in-out lg:hidden ${isMenuOpen ? "max-h-screen py-6 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
          <div className="space-y-4 px-6">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `block py-3 text-lg font-semibold transition-colors ${isActive ? "text-brand-600" : "text-slate-600"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            {token ? (
              <button
                type="button"
                onClick={() => {
                  clearSession();
                  setIsMenuOpen(false);
                }}
                className="w-full py-3 text-left text-lg font-semibold text-red-500"
              >
                Sign Out
              </button>
            ) : (
              <div className="grid gap-2 pt-2">
                <Link to="/login" className="btn-secondary text-center" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-premium text-center" onClick={() => setIsMenuOpen(false)}>
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={isHomePage ? "w-full py-0" : "mx-auto max-w-7xl px-6 py-12 lg:py-16"}>
        <Outlet />
      </main>

      <footer className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-sm">
              <span className="font-display text-xl font-bold text-premium">StagePass</span>
              <p className="mt-2 max-w-xs text-sm text-slate-500">Connecting you to the finest live experiences with zero friction.</p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Reach Out To The Developer</p>
                <p className="mt-2 text-sm text-slate-500">Questions, feedback, or collaboration ideas are always welcome.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-slate-500">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-200 transition-colors hover:border-premium hover:text-premium"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-400">© 2026 StagePass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
