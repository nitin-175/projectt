import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "../components/SectionHeader";
import { deleteMyProfile, updateMyProfile } from "../services/userService";
import { useSessionStore } from "../store/sessionStore";

export function ProfilePage() {
  const navigate = useNavigate();
  const { userName, email, roles, setSession, clearSession } = useSessionStore();
  const [form, setForm] = useState({
    name: userName ?? "",
    email: email ?? "",
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const payload = await updateMyProfile({
        name: form.name,
        email: form.email,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword || undefined,
      });

      setSession({
        token: payload.token,
        roles: payload.roles,
        userName: payload.name,
        email: payload.email,
        venueIds: payload.venueIds,
      });

      setForm((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
      }));
      setSaveSuccess("Profile updated successfully.");
    } catch (error) {
      setSaveError(readErrorMessage(error, "Unable to update your profile."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount(event: React.FormEvent) {
    event.preventDefault();
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteMyProfile(deletePassword);
      clearSession();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteError(readErrorMessage(error, "Unable to delete your account."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-16">
      <SectionHeader
        eyebrow="Identity Control"
        title="Your StagePass Profile."
        description="Update your name, email, and password, or remove your account completely."
      />

      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[40px] border border-surface-200 bg-white shadow-premium">
          <div className="relative h-40 bg-premium">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-transparent" />
            <div className="absolute -bottom-16 left-12 h-32 w-32 rounded-3xl bg-white p-2 shadow-xl">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-50 text-4xl font-black text-brand-600">
                {userName?.charAt(0) ?? "U"}
              </div>
            </div>
          </div>

          <div className="px-12 pb-12 pt-24">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div>
                <h1 className="font-display text-4xl font-black text-premium">{userName}</h1>
                <p className="mt-1 text-lg font-medium text-slate-400">{email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span key={role} className="rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-600">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-16 grid gap-8 border-t border-surface-100 pt-12 lg:grid-cols-[1.6fr_1fr]">
              <form onSubmit={handleSave} className="space-y-6 rounded-[32px] border border-surface-100 bg-surface-50/50 p-8">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Profile Settings</p>
                  <h3 className="text-2xl font-black text-premium">Update Credentials</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                    <input
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      type="text"
                      required
                      className="w-full rounded-2xl border border-surface-200 bg-white px-6 py-4 text-premium outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                    <input
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      type="email"
                      required
                      className="w-full rounded-2xl border border-surface-200 bg-white px-6 py-4 text-premium outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Password</label>
                  <div className="relative">
                    <input
                      value={form.currentPassword}
                      onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      className="w-full rounded-2xl border border-surface-200 bg-white px-6 py-4 pr-28 text-premium outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-surface-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-600"
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">New Password</label>
                  <div className="relative">
                    <input
                      value={form.newPassword}
                      onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
                      type={showNewPassword ? "text" : "password"}
                      minLength={6}
                      placeholder="Leave blank to keep your current password"
                      className="w-full rounded-2xl border border-surface-200 bg-white px-6 py-4 pr-28 text-premium outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-surface-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-600"
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {saveError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {saveError}
                  </div>
                ) : null}
                {saveSuccess ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {saveSuccess}
                  </div>
                ) : null}

                <button type="submit" disabled={saving} className="btn-premium px-10 disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>

              <form onSubmit={handleDeleteAccount} className="space-y-6 rounded-[32px] border border-red-100 bg-red-50/80 p-8">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-400">Danger Zone</p>
                  <h3 className="text-2xl font-black text-premium">Delete Account</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">
                  This permanently removes your account. To continue, confirm with your current password.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Password</label>
                  <input
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    type="password"
                    required
                    className="w-full rounded-2xl border border-red-100 bg-white px-6 py-4 text-premium outline-none transition-all focus:border-red-300 focus:ring-4 focus:ring-red-200/50"
                  />
                </div>

                {deleteError ? (
                  <div className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600">
                    {deleteError}
                  </div>
                ) : null}

                <button type="submit" disabled={deleting} className="rounded-full bg-red-600 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-red-700 active:scale-[0.98] disabled:opacity-50">
                  {deleting ? "Deleting..." : "Delete My Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function readErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data?.error === "string") {
      return data.error;
    }
    if (typeof data?.message === "string") {
      return data.message;
    }
  }

  return fallback;
}
