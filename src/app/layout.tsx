import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Court bookings",
  description: "Book the pickleball court, view hours, and get in touch.",
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
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight text-[var(--court-green)]">
              Pickleball Court
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
          Private court — bookings subject to availability and house rules.
        </footer>
      </body>
    </html>
  );
}
