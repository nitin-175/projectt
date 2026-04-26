import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { ShowSummary, VenueSummary } from "@show-booking/types";
import { createShow, deleteShow, getManagedShows, updateShow, type ShowFormPayload } from "../../services/showService";
import { getVenues } from "../../services/venueService";
import { Modal } from "../../components/Modal";
import { PosterArtwork } from "../../components/PosterArtwork";
import { useSessionStore } from "../../store/sessionStore";
import { resolveMediaUrl } from "../../utils/media";

const defaultShowForm: ShowFormPayload = {
  title: "",
  description: "",
  duration: 120,
  language: "English",
  genre: "Theater",
  posterUrl: "",
  venueIds: [],
  timings: [
    {
      venueId: 0,
      startTime: "",
      price: 499,
    },
  ],
};

export function ManageShowsPage() {
  const roles = useSessionStore((state) => state.roles);
  const organizerVenueIds = useSessionStore((state) => state.venueIds);
  const isOrganizerOnly = roles.includes("ORGANIZER") && !roles.includes("ADMIN");
  const [shows, setShows] = useState<ShowSummary[]>([]);
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<ShowSummary | null>(null);
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<ShowFormPayload>(defaultShowForm);

  const availableVenues = useMemo(
    () => (isOrganizerOnly ? venues.filter((venue) => organizerVenueIds.includes(venue.id)) : venues),
    [isOrganizerOnly, organizerVenueIds, venues],
  );

  useEffect(() => {
    void Promise.all([fetchShows(), fetchVenues()]);
  }, []);

  async function fetchShows() {
    try {
      setLoading(true);
      const data = await getManagedShows();
      setShows(data);
      setError(null);
    } catch {
      setError("Failed to load managed shows.");
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

  function resetForm() {
    setShowForm({
      ...defaultShowForm,
      venueIds: [],
      timings: defaultShowForm.timings.map((timing) => ({ ...timing })),
    });
    setEditingShow(null);
    setImageSource("url");
    setSelectedFile(null);
    setFormError(null);
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(show: ShowSummary) {
    const existingTimings = (show.timings ?? []).map((timing) => ({
      venueId: timing.venueId,
      startTime: toDateTimeInputValue(timing.startTime),
      price: timing.price,
    }));

    setEditingShow(show);
    const posterUrl = show.posterUrl ?? "";
    setShowForm({
      title: show.title,
      description: show.description,
      duration: show.durationMinutes,
      language: show.language,
      genre: show.genre,
      posterUrl,
      venueIds: show.venues.map((venue) => venue.id),
      timings: existingTimings.length > 0
        ? existingTimings
        : [
            {
              venueId: show.venues[0]?.id ?? 0,
              startTime: "",
              price: 499,
            },
          ],
    });
    setImageSource(posterUrl.startsWith("/uploads/") ? "upload" : "url");
    setSelectedFile(null);
    setFormError(null);
    setIsModalOpen(true);
  }

  function toggleVenue(venueId: number) {
    setShowForm((current) => {
      const nextVenueIds = current.venueIds.includes(venueId)
        ? current.venueIds.filter((id) => id !== venueId)
        : [...current.venueIds, venueId];

      return {
        ...current,
        venueIds: nextVenueIds,
        timings: current.timings.map((timing) => ({
          ...timing,
          venueId: nextVenueIds.includes(timing.venueId) ? timing.venueId : (nextVenueIds[0] ?? 0),
        })),
      };
    });
  }

  function addTiming() {
    setShowForm((current) => ({
      ...current,
      timings: [
        ...current.timings,
        {
          venueId: current.venueIds[0] ?? 0,
          startTime: "",
          price: 499,
        },
      ],
    }));
  }

  function updateTiming(index: number, field: "venueId" | "startTime" | "price", value: number | string) {
    setShowForm((current) => ({
      ...current,
      timings: current.timings.map((timing, timingIndex) =>
        timingIndex === index
          ? {
              ...timing,
              [field]: field === "price" || field === "venueId" ? Number(value) : value,
            }
          : timing,
      ),
    }));
  }

  function removeTiming(index: number) {
    setShowForm((current) => ({
      ...current,
      timings: current.timings.length === 1 ? current.timings : current.timings.filter((_, timingIndex) => timingIndex !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalizedPosterUrl = showForm.posterUrl.trim();

    if (showForm.venueIds.length === 0) {
      setFormError("Select at least one venue for this show.");
      return;
    }

    if (showForm.timings.length === 0 || showForm.timings.some((timing) => !timing.venueId || !timing.startTime || timing.price <= 0)) {
      setFormError("Add at least one valid schedule with venue, date, time, and price.");
      return;
    }

    try {
      const payload = {
        ...showForm,
        posterUrl: normalizedPosterUrl,
      };
      if (editingShow) {
        await updateShow(editingShow.id, payload, imageSource === "upload" ? (selectedFile ?? undefined) : undefined);
      } else {
        await createShow(payload, imageSource === "upload" ? (selectedFile ?? undefined) : undefined);
      }

      setIsModalOpen(false);
      resetForm();
      await fetchShows();
    } catch (error) {
      setFormError(readErrorMessage(error, editingShow ? "Failed to update show." : "Failed to create show."));
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this show? This action is permanent.")) return;

    try {
      await deleteShow(id);
      setShows((current) => current.filter((show) => show.id !== id));
    } catch (error) {
      alert(readErrorMessage(error, "Failed to delete show."));
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.4em] text-brand-500">
            {isOrganizerOnly ? "Venue Control" : "Inventory Control"}
          </p>
          <h1 className="font-display text-4xl font-black text-white sm:text-5xl">
            {isOrganizerOnly ? "Organizer Shows" : "Show Management"}
          </h1>
        </div>
        <button onClick={openCreateModal} className="btn-premium w-full !px-8 !py-4 text-sm group sm:w-auto">
          <svg className="mr-2 inline-block h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Show
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingShow ? "Edit Show" : "Create Show"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Show Title</label>
              <input
                type="text"
                required
                value={showForm.title}
                onChange={(event) => setShowForm({ ...showForm, title: event.target.value })}
                placeholder="e.g. Midnight Echoes"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Genre</label>
              <select
                value={showForm.genre}
                onChange={(event) => setShowForm({ ...showForm, genre: event.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
              >
                <option value="Theater" className="bg-slate-900">Theater</option>
                <option value="Opera" className="bg-slate-900">Opera</option>
                <option value="Jazz" className="bg-slate-900">Jazz</option>
                <option value="Musical" className="bg-slate-900">Musical</option>
                <option value="Concert" className="bg-slate-900">Concert</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duration (mins)</label>
              <input
                type="number"
                min={1}
                required
                value={showForm.duration}
                onChange={(event) => setShowForm({ ...showForm, duration: Number(event.target.value) })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Language</label>
              <input
                type="text"
                required
                value={showForm.language}
                onChange={(event) => setShowForm({ ...showForm, language: event.target.value })}
                placeholder="e.g. English"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</label>
            <textarea
              required
              rows={4}
              value={showForm.description}
              onChange={(event) => setShowForm({ ...showForm, description: event.target.value })}
              placeholder="Provide a compelling narrative for this show..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Venues</label>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Choose one or more venues
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {availableVenues.map((venue) => {
                const selected = showForm.venueIds.includes(venue.id);
                return (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => toggleVenue(venue.id)}
                    className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                      selected
                        ? "border-brand-500 bg-brand-500/10 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-brand-500/40"
                    }`}
                  >
                    <p className="text-sm font-bold">{venue.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{venue.city}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">{venue.address}</p>
                  </button>
                );
              })}
            </div>
            {availableVenues.length === 0 ? (
              <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                No venues are assigned yet. Ask an admin to assign venue access before creating shows.
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Schedules</label>
                <p className="mt-1 text-xs text-slate-500">Add the venue, date, and time users can book.</p>
              </div>
              <button
                type="button"
                onClick={addTiming}
                className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-300 transition-all hover:bg-brand-500/20"
              >
                Add Schedule
              </button>
            </div>

            <div className="space-y-4">
              {showForm.timings.map((timing, index) => (
                <div key={`${index}-${timing.startTime}`} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Schedule {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeTiming(index)}
                      disabled={showForm.timings.length === 1}
                      className="text-xs font-bold text-slate-500 transition-colors hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Venue</label>
                      <select
                        required
                        value={timing.venueId}
                        onChange={(event) => updateTiming(index, "venueId", Number(event.target.value))}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition-all focus:border-brand-500"
                      >
                        <option value={0} className="bg-slate-900">Select venue</option>
                        {availableVenues
                          .filter((venue) => showForm.venueIds.includes(venue.id))
                          .map((venue) => (
                            <option key={venue.id} value={venue.id} className="bg-slate-900">
                              {venue.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={timing.startTime}
                        onChange={(event) => updateTiming(index, "startTime", event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition-all focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ticket Price</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={timing.price}
                        onChange={(event) => updateTiming(index, "price", Number(event.target.value))}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition-all focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Poster Image</label>
              <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setImageSource("url");
                    setSelectedFile(null);
                  }}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    imageSource === "url" ? "rounded-lg bg-brand-500 text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource("upload")}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    imageSource === "upload" ? "rounded-lg bg-brand-500 text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {imageSource === "url" ? (
              <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                <input
                  type="text"
                  value={showForm.posterUrl}
                  onChange={(event) => setShowForm({ ...showForm, posterUrl: event.target.value })}
                  placeholder="https://images.example.com/poster.jpg"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white outline-none transition-all focus:border-brand-500"
                />
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <PosterArtwork
                    title={showForm.title || "Poster Preview"}
                    posterUrl={resolveMediaUrl(showForm.posterUrl.trim())}
                    className="h-full min-h-[160px] w-full"
                    imageClassName="h-full w-full object-cover"
                    fallbackClassName="flex h-full min-h-[160px] w-full items-center justify-center bg-white/5 px-5"
                    titleClassName="text-center font-display text-lg font-black uppercase tracking-[0.2em] text-white/20"
                  />
                </div>
              </div>
            ) : (
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <div className="w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/5 px-6 py-8 text-center transition-all group-hover:border-brand-500/50">
                  <svg className="mx-auto mb-4 h-8 w-8 text-slate-500 transition-colors group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-bold text-slate-400 transition-colors group-hover:text-slate-200">
                    {selectedFile ? selectedFile.name : "Select image from device"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {formError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-4 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="rounded-2xl border border-white/10 px-8 py-4 font-bold text-slate-500 transition-all hover:bg-white/5"
            >
              Cancel
            </button>
            <button type="submit" className="btn-premium px-12 py-4">
              {editingShow ? "Save Changes" : "Create Show"}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse rounded-[32px] border border-white/5 bg-white/5 p-8">
              <div className="mb-6 h-48 rounded-2xl bg-white/5" />
              <div className="mb-4 h-4 w-2/3 rounded-full bg-white/10" />
              <div className="h-4 w-1/2 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[40px] border border-red-500/20 bg-red-500/5 p-12 text-center text-red-500">
          {error}
        </div>
      ) : shows.length === 0 ? (
        <div className="relative overflow-hidden rounded-[40px] border border-white/5 bg-white/5 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent" />
          <div className="relative z-10">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] border border-white/10 bg-white/5 shadow-inner">
              <svg className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white">No managed shows found.</h3>
            <p className="mx-auto mt-4 max-w-lg text-lg text-slate-400">
              {isOrganizerOnly
                ? "Shows assigned to your venue will appear here once created."
                : "Create your first show and assign it to one or more venues."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {shows.map((show) => (
            <div key={show.id} className="group rounded-[40px] border border-white/5 bg-white/5 p-8 transition-all duration-500 hover:border-white/10 hover:shadow-2xl">
              <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                <PosterArtwork
                  title={show.title}
                  posterUrl={show.posterUrl}
                  className="h-full w-full"
                  imageClassName="h-full w-full object-cover"
                  fallbackClassName="flex h-full w-full items-center justify-center bg-white/5 px-4"
                  titleClassName="text-center font-display text-2xl font-black uppercase tracking-widest text-white/10 transition-colors group-hover:text-brand-500/20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
                  <button
                    onClick={() => openEditModal(show)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/20 text-brand-300 transition-all hover:bg-brand-500 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(show.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/20 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-500">{show.genre}</p>
              <h3 className="line-clamp-1 text-xl font-black text-white transition-colors group-hover:text-brand-400">{show.title}</h3>
              <p className="mt-4 line-clamp-2 text-sm text-slate-400">{show.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {show.venues.map((venue) => (
                  <span key={venue.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {venue.name}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
                <span className="text-xs font-bold italic text-slate-500">{show.durationMinutes} mins</span>
                <span className="rounded-lg bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-widest text-white">{show.language}</span>
              </div>
            </div>
          ))}
        </div>
      )}
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

function toDateTimeInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}
