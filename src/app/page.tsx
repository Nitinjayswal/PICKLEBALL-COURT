import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-[var(--court-green)] to-[var(--court-green-light)] p-8 text-white shadow-lg sm:p-10">
        <p className="text-sm font-medium uppercase tracking-wide text-white/80">
          Welcome
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Reserve a session on the court
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/90">
          Pick a time that works for you, send a note if you need anything special, and
          reach us by email or WhatsApp if you have questions before you book.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[var(--court-green)] shadow hover:bg-stone-50"
          >
            Book a slot
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Ask a question
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Simple booking",
            body: "Choose a day and an open slot. We block double-bookings automatically.",
          },
          {
            title: "Email & WhatsApp",
            body: "Use the contact form for email, or tap WhatsApp for a quick chat.",
          },
          {
            title: "House rules",
            body: "Courts, noise, and cancellations — all spelled out on the info page.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-stone-900">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
