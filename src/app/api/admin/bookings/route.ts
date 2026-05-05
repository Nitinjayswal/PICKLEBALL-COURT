import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, verifyAdminSession } from "@/lib/admin-session";
import { getServiceSupabase } from "@/lib/supabase/admin";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(adminCookieName)?.value;
  if (!verifyAdminSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .select("id,court_id,start_at,end_at,name,email,phone,notes,status,created_at")
      .order("start_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json({ bookings: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
