import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_ADDRESS, SITE_LOGO_PATH, SITE_NAME, SITE_TAGLINE } from "@/lib/site-brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE_NAME} · Book a session`,
  description: `${SITE_NAME} — ${SITE_TAGLINE}. ${SITE_ADDRESS}. Book a court session, view hours, and get in touch.`,
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book" },
  { href: "/info", label: "Hours & rules" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-stone-200 bg-white/90 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-3 text-[var(--court-green)] hover:opacity-90"
            >
              <Image
                src={SITE_LOGO_PATH}
                alt={`${SITE_NAME} logo`}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full object-contain ring-1 ring-stone-200/80"
                priority
              />
              <span className="flex flex-col leading-tight">
                <span className="font-semibold tracking-tight">{SITE_NAME}</span>
                <span className="text-xs font-medium text-stone-500">{SITE_ADDRESS}</span>
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-stone-600">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-1 hover:bg-stone-100 hover:text-stone-900"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="rounded-md px-2 py-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              >
                Owner
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
          <p className="font-medium text-stone-700">
            {SITE_NAME} · {SITE_ADDRESS}
          </p>
          <p className="mt-1 text-stone-500">{SITE_TAGLINE}</p>
          <p className="mt-2 text-xs text-stone-400">
            Bookings subject to availability and house rules.
          </p>
        </footer>
      </body>
    </html>
  );
}
