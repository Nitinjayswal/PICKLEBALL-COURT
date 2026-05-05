"use client";

import { useState } from "react";

function waLink(prefill: string) {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_E164;
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(prefill)}`;
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [waUrl, setWaUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErr(null);
    setWaUrl(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.whatsappUrl) setWaUrl(data.whatsappUrl as string);
        throw new Error(data.error || "Something went wrong");
      }
      if (data.whatsappUrl) setWaUrl(data.whatsappUrl as string);
      setStatus("ok");
      setMessage("");
    } catch (e) {
      setStatus("err");
      setErr(e instanceof Error ? e.message : "Request failed");
    }
  }

  const draft = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : "",
    "",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const quickWa = waLink("Hi — I have a question about the pickleball court.");

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Contact</h1>
        <p className="mt-2 text-sm text-stone-600">
          Send an email through the form, or message on WhatsApp. Replace placeholders in{" "}
          <code className="rounded bg-stone-100 px-1 text-xs">.env.local</code> with real values
          before going live.
        </p>
      </div>

      {quickWa && (
        <a
          href={quickWa}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
        >
          Message on WhatsApp
        </a>
      )}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          aria-hidden
        />
        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600" htmlFor="c-name">
            Name
          </label>
          <input
            id="c-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600" htmlFor="c-email">
            Email
          </label>
          <input
            id="c-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600" htmlFor="c-phone">
            Phone (optional)
          </label>
          <input
            id="c-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-stone-600" htmlFor="c-msg">
            Message
          </label>
          <textarea
            id="c-msg"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Email the owner"}
        </button>
        {status === "ok" && (
          <p className="text-sm text-emerald-800">Sent. We will get back to you shortly.</p>
        )}
        {status === "err" && err && (
          <p className="text-sm text-red-800">{err}</p>
        )}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-sm font-semibold text-emerald-800 underline"
          >
            Open WhatsApp with the same message
          </a>
        )}
      </form>

      {!quickWa && (
        <p className="text-xs text-stone-500">
          Set <code className="rounded bg-stone-100 px-1">NEXT_PUBLIC_WHATSAPP_E164</code> (digits
          only, include country code) to show WhatsApp shortcuts.
        </p>
      )}

      {quickWa && draft.trim().length > 10 && (
        <a
          href={waLink(draft) ?? quickWa}
          target="_blank"
          rel="noreferrer"
          className="block text-center text-sm text-stone-600 underline"
        >
          Send this draft on WhatsApp instead
        </a>
      )}
    </div>
  );
}
