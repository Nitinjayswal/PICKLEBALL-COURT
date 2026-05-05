import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/admin-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName, "", { path: "/", maxAge: 0 });
  return res;
}
