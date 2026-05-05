"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SITE_NAME } from "@/lib/site-brand";
import {
  buildSlotsForDay,
  formatLocalDate,
  formatSlotLabel,
  parseLocalDate,
} from "@/lib/slots";

type SlotRow = { key: string; start: string; end: string; available: boolean };

export default function BookPage() {
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<SlotRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedStart(null);
    setDone(null);
    try {
      const res = await fetch(`/api/bookings?date=${encodeURIComponent(date)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load slots");
      setSlots(data.slots as SlotRow[]);
    } catch (e) {
      setSlots(null);
      setError(e instanceof Error ? e.message : "Could not load slots");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStart) {
      setError("Pick a time slot first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          slotStart: selectedStart,
          name,
          email,
          phone,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setDone("You are booked. See you at Pickolo.");
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setSelectedStart(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  const day = parseLocalDate(date);
  const previewSlots = day && !slots ? buildSlotsForDay(day) : null;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Book a session</h1>
        <p className="mt-2 text-sm text-stone-600">
          {SITE_NAME} — one-hour slots. Pick a day, choose an open time, and confirm your contact
          details.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--court-green)] focus:outline-none focus:ring-2 focus:ring-[var(--court-green)]/30"
        />
      </div>

      {loading && <p className="text-sm text-stone-500">Loading availability…</p>}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {done && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {done}
        </p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-stone-700">Available times</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots?.map((s) => (
            <button
              key={s.key}
              type="button"
              disabled={!s.available}
              onClick={() => s.available && setSelectedStart(s.start)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                !s.available
                  ? "cursor-not-allowed border-stone-100 bg-stone-100 text-stone-400 line-through"
                  : selectedStart === s.start
                    ? "border-[var(--court-green)] bg-[var(--court-green)]/10 text-[var(--court-green)]"
                    : "border-stone-200 bg-white text-stone-800 hover:border-stone-300"
              }`}
            >
              {formatSlotLabel(new Date(s.start))}
            </button>
          ))}
          {!slots &&
            previewSlots?.map((s) => (
              <div
                key={s.key}
                className="rounded-lg border border-dashed border-stone-200 px-3 py-2 text-sm text-stone-400"
              >
                {formatSlotLabel(s.start)}
              </div>
            ))}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Your details</h2>
        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600" htmlFor="notes">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !selectedStart}
          className="w-full rounded-lg bg-[var(--court-green)] py-2.5 text-sm font-semibold text-white shadow hover:bg-[var(--court-green-light)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Confirm booking"}
        </button>
      </form>
    </div>
  );
}
