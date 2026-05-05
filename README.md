# Pickleball court website

Next.js app for a private court: **public booking grid**, **contact form → email** (Resend), **WhatsApp deep links**, and a minimal **owner** view at `/admin`.

## Prerequisites

- Node 20+
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) API key (or change the contact route to another mailer)

## Setup

1. Copy [`.env.example`](.env.example) to `.env.local` and fill in values.

2. In Supabase SQL editor, run [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).

3. Install and run locally:

```bash
cd pickleball-court
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Blackouts

Insert rows into `blackouts` (`starts_at`, `ends_at`) for maintenance or private events. Slots overlapping those intervals cannot be booked.

## Customize hours & slot length

Edit [`src/lib/slots.ts`](src/lib/slots.ts): `DAY_START_HOUR`, `DAY_END_HOUR`, and `SLOT_MINUTES`.

## Deploy

Deploy to [Vercel](https://vercel.com) (or any Node host). Add the same environment variables in the project settings. Use HTTPS in production so admin cookies stay `Secure`.

## Security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` to the client.
- Change `ADMIN_PASSWORD` and prefer a separate long `ADMIN_SESSION_SECRET`.
- The contact form includes a honeypot field; consider rate limiting at the edge for production.
