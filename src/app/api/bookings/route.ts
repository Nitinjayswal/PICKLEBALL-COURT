import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { SITE_NAME, DEFAULT_EMAIL_FROM } from "@/lib/site-brand";
import { SITE_OWNER_EMAIL } from "@/lib/site-contact";
import {
  buildSlotsForDay,
  formatLocalDate,
  formatSlotLabel,
  parseLocalDate,
} from "@/lib/slots";

const COURT_ID = "main";

/** Supabase / PostgREST errors are often plain objects, not `Error` instances. */
function routeErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string" && e.length > 0) return e;
  if (typeof e === "object" && e !== null) {
    const o = e as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.length > 0) return o.message;
    if (typeof o.error_description === "string" && o.error_description.length > 0) {
      return o.error_description;
    }
    if (typeof o.hint === "string" && o.hint.length > 0) return o.hint;
  }
  return "Server error";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
  }
  const day = parseLocalDate(date);
  if (!day) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: bookings, error: bErr } = await supabase
      .from("bookings")
      .select("start_at,end_at,status")
      .eq("court_id", COURT_ID)
      .gte("start_at", startOfDay.toISOString())
      .lte("start_at", endOfDay.toISOString());

    if (bErr) throw bErr;

    const { data: blackouts, error: blErr } = await supabase
      .from("blackouts")
      .select("starts_at,ends_at")
      .lte("starts_at", endOfDay.toISOString())
      .gte("ends_at", startOfDay.toISOString());

    if (blErr) throw blErr;

    const taken = new Set(
      (bookings ?? [])
        .filter((r) => r.status !== "cancelled")
        .map((r) => new Date(r.start_at as string).toISOString()),
    );

    const slots = buildSlotsForDay(day).map((s) => {
      const overlapsBlackout = (blackouts ?? []).some((b) => {
        const bs = new Date(b.starts_at as string).getTime();
        const be = new Date(b.ends_at as string).getTime();
        return s.start.getTime() < be && s.end.getTime() > bs;
      });
      return {
        key: s.key,
        start: s.start.toISOString(),
        end: s.end.toISOString(),
        available: !taken.has(s.start.toISOString()) && !overlapsBlackout,
      };
    });

    return NextResponse.json({ date: formatLocalDate(day), slots });
  } catch (e) {
    return NextResponse.json({ error: routeErrorMessage(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: {
    date?: string;
    slotStart?: string;
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { date, slotStart, name, email, phone, notes } = body;
  if (!date || !slotStart || !name || !email || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const day = parseLocalDate(date);
  if (!day) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const start = new Date(slotStart);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const slots = buildSlotsForDay(day);
  const match = slots.find((s) => s.start.getTime() === start.getTime());
  if (!match) {
    return NextResponse.json({ error: "Slot outside allowed window" }, { status: 400 });
  }
  const end = match.end;

  try {
    const supabase = getServiceSupabase();

    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: blackouts, error: blErr } = await supabase
      .from("blackouts")
      .select("starts_at,ends_at")
      .lte("starts_at", endOfDay.toISOString())
      .gte("ends_at", startOfDay.toISOString());

    if (blErr) throw blErr;

    const overlapsBlackout = (blackouts ?? []).some((b) => {
      const bs = new Date(b.starts_at as string).getTime();
      const be = new Date(b.ends_at as string).getTime();
      return start.getTime() < be && end.getTime() > bs;
    });
    if (overlapsBlackout) {
      return NextResponse.json({ error: "That time is blocked" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        court_id: COURT_ID,
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: notes?.trim() || null,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "That slot was just taken" }, { status: 409 });
      }
      throw error;
    }

    const bookingId = data?.id as string | undefined;
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const ownerEmail = process.env.OWNER_EMAIL?.trim() || SITE_OWNER_EMAIL;
    const from = process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM;

    let ownerNotified = false;
    if (resendKey && bookingId) {
      const dateLine = formatLocalDate(day);
      const timeLine = `${formatSlotLabel(start)} – ${formatSlotLabel(end)}`;
      const lines = [
        `New booking at ${SITE_NAME}`,
        "",
        `Date: ${dateLine}`,
        `Time: ${timeLine}`,
        "",
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Phone: ${phone.trim()}`,
        notes?.trim() ? `Notes: ${notes.trim()}` : null,
        "",
        `Booking id: ${bookingId}`,
      ].filter(Boolean) as string[];
      const textBody = lines.join("\n");
      const htmlBody = `<pre style="font-family:system-ui">${textBody.replace(/</g, "&lt;")}</pre>`;
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [ownerEmail],
            reply_to: email.trim(),
            subject: `${SITE_NAME} booking: ${dateLine} ${formatSlotLabel(start)}`,
            html: htmlBody,
            text: textBody,
          }),
        });
        ownerNotified = res.ok;
        if (!res.ok) {
          console.error("[bookings] owner notify email failed", await res.text());
        }
      } catch (err) {
        console.error("[bookings] owner notify email error", err);
      }
    }

    return NextResponse.json({ ok: true, id: bookingId, ownerNotified });
  } catch (e) {
    return NextResponse.json({ error: routeErrorMessage(e) }, { status: 500 });
  }
}
