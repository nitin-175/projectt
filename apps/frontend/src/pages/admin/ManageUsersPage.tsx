import axios from "axios";
import { useEffect, useState } from "react";
import type { VenueSummary } from "@show-booking/types";
import { Modal } from "../../components/Modal";
import { getUsers, provisionUser, updateUserRoles, type UserSummary } from "../../services/userService";
import { getVenues } from "../../services/venueService";

const clearanceOptions = ["ADMIN", "ORGANIZER", "USER"] as const;

export function ManageUsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    void Promise.all([fetchUsers(), fetchVenues()]);
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch {
      setError("Failed to synchronize identity database.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchVenues() {
    try {
      const data = await getVenues();
      setVenues(data);
    } catch {
      setVenues([]);
    }
  }

  async function handleProvision(event: React.FormEvent) {
    event.preventDefault();
    try {
      await provisionUser(newUser);
      setIsModalOpen(false);
      setProvisionError(null);
      setNewUser({ name: "", email: "", password: "" });
      await fetchUsers();
    } catch (error) {
      setProvisionError(readErrorMessage(error, "Failed to provision new identity."));
    }
  }

  async function handleRoleUpdate(userId: number, roles: string[], venueIds: number[]) {
    try {
      await updateUserRoles(userId, roles, venueIds);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      setRoleError(null);
      await fetchUsers();
    } catch (error) {
      console.error("Role update failed:", error);
      setRoleError(readErrorMessage(error, "Failed to update security clearance levels."));
    }
  }

  const isOrganizerSelected = selectedUser?.roles.includes("ORGANIZER") ?? false;

  function toggleSelectedVenue(venueId: number) {
    setSelectedUser((current) => {
      if (!current) return current;

      const exists = current.organizerVenues.some((venue) => venue.id === venueId);
      const venueToAdd = venues.find((venue) => venue.id === venueId);
      if (!exists && !venueToAdd) {
        return current;
      }

      return {
        ...current,
        organizerVenues: exists
          ? current.organizerVenues.filter((venue) => venue.id !== venueId)
          : [...current.organizerVenues, venueToAdd as VenueSummary],
      };
    });
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.4em] text-brand-500">Access Governance</p>
          <h1 className="font-display text-4xl font-black text-white sm:text-5xl">Identity Management</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-premium w-full !px-8 !py-4 text-sm group sm:w-auto">
          <svg className="mr-2 inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Provision New Identity
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProvisionError(null);
        }}
        title="Provision New Identity"
      >
        <form onSubmit={handleProvision} className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Identity Details</p>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legal Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
                  placeholder="e.g. Alexander Vance"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
                  placeholder="vance@stagepass.local"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Credentials (Password)</label>
              <input
                type="password"
                required
                value={newUser.password}
                onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
                placeholder="Enter a temporary password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
              />
            </div>
          </div>

          {provisionError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {provisionError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-4 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setProvisionError(null);
              }}
              className="rounded-2xl border border-white/10 px-8 py-4 font-bold text-slate-500 transition-all hover:bg-white/5"
            >
              Cancel
            </button>
            <button type="submit" className="btn-premium px-12 py-4">
              Establish Handshake
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setRoleError(null);
        }}
        title="Override Security Clearances"
      >
        <div className="space-y-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Target Identity</p>
            <h3 className="text-xl font-black text-white">{selectedUser?.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{selectedUser?.email}</p>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Authorization Level</label>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {clearanceOptions.map((role) => (
                <button
                  key={role}
                  onClick={() =>
                    setSelectedUser((current) =>
                      current
                        ? {
                            ...current,
                            roles: [role],
                            organizerVenues: role === "ORGANIZER" ? current.organizerVenues : [],
                          }
                        : null,
                    )
                  }
                  className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all ${
                    selectedUser?.roles.includes(role)
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-brand-500/30 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-2 w-2 rounded-full ${selectedUser?.roles.includes(role) ? "bg-brand-500 shadow-[0_0_12px_rgba(235,46,121,0.5)]" : "bg-slate-700"}`} />
                      <span className="text-xs font-bold uppercase tracking-widest">{role}</span>
                    </div>
                    {selectedUser?.roles.includes(role) ? (
                      <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {isOrganizerSelected ? (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assigned Venues</label>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {venues.map((venue) => {
                  const selected = selectedUser?.organizerVenues.some((item) => item.id === venue.id) ?? false;
                  return (
                    <button
                      key={venue.id}
                      type="button"
                      onClick={() => toggleSelectedVenue(venue.id)}
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? "border-brand-500/50 bg-brand-500/10 text-brand-300"
                          : "border-white/10 bg-white/5 text-slate-400 hover:border-brand-500/30"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{venue.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{venue.city}</p>
                      </div>
                      {selected ? (
                        <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Organizer accounts can manage only the shows linked to the venues selected here.
              </p>
            </div>
          ) : null}

          {roleError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {roleError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-4 border-t border-white/5 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsRoleModalOpen(false);
                setRoleError(null);
              }}
              className="rounded-2xl border border-white/10 px-8 py-4 font-bold text-slate-500 transition-all hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                selectedUser &&
                handleRoleUpdate(
                  selectedUser.id,
                  selectedUser.roles,
                  selectedUser.organizerVenues.map((venue) => venue.id),
                )
              }
              className="btn-premium px-12 py-4"
            >
              Synchronize Authorization
            </button>
          </div>
        </div>
      </Modal>

      <div className="overflow-hidden rounded-[40px] border border-white/5 bg-white/5 shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-white/5 bg-white/[0.02] p-5 sm:p-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row">
            <input
              type="text"
              placeholder="Search by identity or email..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-brand-500 lg:w-80"
            />
            <select className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition-all focus:border-brand-500">
              <option className="bg-slate-900">All Permissions</option>
              <option className="bg-slate-900">Administrative</option>
              <option className="bg-slate-900">Standard Member</option>
            </select>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{users.length} identified records</p>
        </div>

        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="space-y-6 p-20">
              {[1, 2, 3].map((index) => (
                <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="p-20 text-center text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="p-20 text-center">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] border border-white/10 bg-white/5 shadow-inner">
                <svg className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white">Identity database is currently disconnected.</h3>
              <p className="mx-auto mt-4 max-w-lg text-lg text-slate-400">Establish a secure handshake with the RBAC synchronization services.</p>
              <button onClick={fetchUsers} className="mt-10 btn-premium px-12 text-xs">
                Initialize Handshake
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-10 py-6">Identity</th>
                    <th className="px-10 py-6">Email Address</th>
                    <th className="px-10 py-6">Privileges</th>
                    <th className="px-10 py-6">Synchronization Date</th>
                    <th className="px-10 py-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="group transition-colors hover:bg-white/[0.02]">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10 text-xs font-black text-brand-500">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-bold uppercase tracking-tight text-white transition-colors group-hover:text-brand-400">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-sm text-slate-400">{user.email}</td>
                      <td className="px-10 py-6">
                        <div className="flex gap-2">
                          {user.roles.map((role) => (
                            <span key={role} className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                              {role}
                            </span>
                          ))}
                        </div>
                        {user.organizerVenues.length > 0 ? (
                          <p className="mt-3 text-xs text-slate-500">
                            Venues: {user.organizerVenues.map((venue) => venue.name).join(", ")}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-10 py-6 text-xs font-medium text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-10 py-6">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsRoleModalOpen(true);
                            setRoleError(null);
                          }}
                          className="text-xs font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-white"
                        >
                          Modify Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
