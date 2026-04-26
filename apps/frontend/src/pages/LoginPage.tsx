import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../services/authService";
import { useSessionStore } from "../store/sessionStore";

const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const setSession = useSessionStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get("googleError"));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = await login({ email, password });
      setSession({
        token: payload.token,
        roles: payload.roles,
        userName: payload.name,
        email: payload.email,
        venueIds: payload.venueIds,
      });
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    } catch {
      setError("Unable to log in with those credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleContinue() {
    if (googleAuthUrl) {
      window.location.href = googleAuthUrl;
      return;
    }

    setError("Google sign-in placeholder is ready. Add VITE_GOOGLE_AUTH_URL to enable it.");
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-[40px] border border-surface-200 bg-white shadow-premium">
        <div className="bg-premium p-12 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-400">Secure Access</p>
          <h1 className="mt-4 font-display text-4xl font-black">Welcome Back</h1>
        </div>
        <div className="p-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-6 py-4 text-premium outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-6 py-4 pr-28 text-premium outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-600 shadow-sm transition-colors hover:text-brand-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleContinue}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-surface-200 bg-white px-6 py-4 text-sm font-semibold text-premium transition-all hover:border-brand-200 hover:bg-surface-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 11.8v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 4.8 14.7 4 12 4 7.6 4 4 7.6 4 12s3.6 8 8 8c4.6 0 7.6-3.2 7.6-7.8 0-.5-.1-.9-.1-1.3H12z" />
                <path fill="#34A853" d="M4 12c0 1.4.4 2.8 1.2 4l3.2-2.5c-.2-.5-.4-1-.4-1.5s.1-1 .4-1.5L5.2 8C4.4 9.2 4 10.6 4 12z" />
                <path fill="#FBBC05" d="M12 20c2.7 0 4.9-.9 6.5-2.5l-3.2-2.6c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4l-3.2 2.5C4.8 17.7 8.1 20 12 20z" />
                <path fill="#4285F4" d="M18.5 17.5c1.6-1.5 2.6-3.8 2.6-6.4 0-.5-.1-.9-.1-1.3H12v3.9h5.5c-.3 1.4-1.1 2.8-2.2 3.8l3.2 2.6z" />
              </svg>
              Continue with Google
            </button>

            {error ? (
              <div className="animate-shake rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            ) : null}

            <button type="submit" disabled={loading} className="btn-premium mt-4 flex w-full items-center justify-center disabled:opacity-50">
              {loading ? (
                <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : "Authenticate"}
            </button>
          </form>
          <div className="mt-10 border-t border-surface-100 pt-8 text-center">
            <p className="text-sm font-medium text-slate-400">
              New to StagePass? <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">Create Identity</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
