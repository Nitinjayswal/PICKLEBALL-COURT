"use client";

import { useCallback, useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/site-brand";

type Booking = {
  id: string;
  start_at: string;
  end_at: string;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    setLoading(true);
    if (!opts?.silent) setError(null);
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load");
      setBookings(data.bookings as Booking[]);
      setLoggedIn(true);
    } catch (e) {
      setLoggedIn(false);
      if (!opts?.silent) {
        setError(e instanceof Error ? e.message : "Could not load");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load({ silent: true });
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    setPassword("");
    await load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setBookings([]);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-stone-900">
        {SITE_NAME} — owner dashboard
      </h1>

      {!loggedIn && (
        <form onSubmit={login} className="max-w-sm space-y-3 rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            Enter the admin password from server env (<code className="text-xs">ADMIN_PASSWORD</code>
            ).
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-stone-900 py-2 text-sm font-semibold text-white"
          >
            Unlock
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      )}

      {loggedIn && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-stone-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-100"
            >
              Log out
            </button>
            {loading && <span className="text-sm text-stone-500">Loading…</span>}
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">End</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(b.start_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(b.end_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{b.name}</td>
                    <td className="px-3 py-2">{b.email}</td>
                    <td className="px-3 py-2">{b.phone}</td>
                    <td className="px-3 py-2">{b.status}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-stone-500">
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
