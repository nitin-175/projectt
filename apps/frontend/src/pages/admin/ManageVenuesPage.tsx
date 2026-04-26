import { useEffect, useState } from "react";
import type { VenueSummary } from "@show-booking/types";
import { Modal } from "../../components/Modal";
import { createVenue, getVenues } from "../../services/venueService";

const defaultVenue = {
  name: "",
  city: "",
  address: "",
};

export function ManageVenuesPage() {
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newVenue, setNewVenue] = useState(defaultVenue);

  useEffect(() => {
    void fetchVenues();
  }, []);

  async function fetchVenues() {
    try {
      setLoading(true);
      setError(null);
      setVenues(await getVenues());
    } catch {
      setError("Failed to load venues.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      const createdVenue = await createVenue(newVenue);
      setVenues((current) => [...current, createdVenue]);
      setNewVenue(defaultVenue);
      setFormError(null);
      setIsModalOpen(false);
    } catch {
      setFormError("Failed to create venue.");
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.4em] text-brand-500">Venue Directory</p>
          <h1 className="font-display text-4xl font-black text-white sm:text-5xl">Manage Venues</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-premium w-full !px-8 !py-4 text-sm group sm:w-auto">
          <svg className="mr-2 inline-block h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Venue
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Venue">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Venue Name</label>
              <input
                type="text"
                required
                value={newVenue.name}
                onChange={(event) => setNewVenue({ ...newVenue, name: event.target.value })}
                placeholder="e.g. Skyline Arena"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">City</label>
              <input
                type="text"
                required
                value={newVenue.city}
                onChange={(event) => setNewVenue({ ...newVenue, city: event.target.value })}
                placeholder="e.g. Bengaluru"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Address</label>
            <textarea
              required
              rows={4}
              value={newVenue.address}
              onChange={(event) => setNewVenue({ ...newVenue, address: event.target.value })}
              placeholder="Full venue address"
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
            />
          </div>

          {formError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-4 pt-6 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-white/10 px-8 py-4 font-bold text-slate-500 transition-all hover:bg-white/5">
              Cancel
            </button>
            <button type="submit" className="btn-premium px-12 py-4">
              Save Venue
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse rounded-[32px] border border-white/5 bg-white/5 p-8">
              <div className="mb-4 h-6 w-2/3 rounded-full bg-white/10" />
              <div className="mb-3 h-4 w-1/2 rounded-full bg-white/10" />
              <div className="h-20 rounded-2xl bg-white/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[40px] border border-red-500/20 bg-red-500/5 p-12 text-center text-red-500">
          {error}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue) => (
            <div key={venue.id} className="rounded-[32px] border border-white/5 bg-white/5 p-8">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-500">Venue</p>
              <h3 className="text-2xl font-black text-white">{venue.name}</h3>
              <p className="mt-3 text-sm font-semibold text-slate-300">{venue.city}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">{venue.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
