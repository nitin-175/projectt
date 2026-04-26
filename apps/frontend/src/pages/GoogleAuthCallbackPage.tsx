import type { AppRole } from "@show-booking/types";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";

export function GoogleAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    const error = searchParams.get("error");
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const roles = searchParams.getAll("roles");
    const venueIds = searchParams.getAll("venueIds").map((value) => Number(value)).filter((value) => !Number.isNaN(value));

    if (error) {
      navigate(`/login?googleError=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (!token || !name || !email || roles.length === 0) {
      navigate("/login?googleError=Google%20sign-in%20failed", { replace: true });
      return;
    }

    setSession({
      token,
      roles: roles as AppRole[],
      userName: name,
      email,
      venueIds,
    });
    navigate("/", { replace: true });
  }, [navigate, searchParams, setSession]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center">
      <div className="rounded-[32px] border border-surface-200 bg-white p-10 text-center shadow-premium">
        <p className="text-sm font-semibold text-slate-500">Completing Google sign-in...</p>
      </div>
    </div>
  );
}
