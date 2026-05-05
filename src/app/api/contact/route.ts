import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

function buildWhatsAppPrefill(message: string, phoneE164: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${phoneE164.replace(/\D/g, "")}?text=${text}`;
}

export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    website?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, phone, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Court <onboarding@resend.dev>";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_E164;

  const lines = [
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    phone?.trim() ? `Phone: ${phone.trim()}` : null,
    "",
    message.trim(),
  ].filter(Boolean) as string[];

  const textBody = lines.join("\n");
  const htmlBody = `<pre style="font-family:system-ui">${textBody.replace(/</g, "&lt;")}</pre>`;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = getServiceSupabase();
      await supabase.from("inquiries").insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
      });
    } catch {
      /* optional table — ignore if missing or misconfigured */
    }
  }

  if (!ownerEmail) {
    return NextResponse.json(
      { error: "OWNER_EMAIL is not configured on the server" },
      { status: 503 },
    );
  }

  if (!resendKey) {
    return NextResponse.json(
      {
        error:
          "Email is not configured (set RESEND_API_KEY). Your message was not sent by email.",
        whatsappUrl: wa ? buildWhatsAppPrefill(textBody, wa) : undefined,
      },
      { status: 503 },
    );
  }

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
      subject: `Court inquiry from ${name.trim()}`,
      html: htmlBody,
      text: textBody,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: "Failed to send email", detail: errText },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    whatsappUrl: wa ? buildWhatsAppPrefill(textBody, wa) : undefined,
  });
}
