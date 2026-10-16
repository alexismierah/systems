
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 403 }
    );
  }

  if (profile.role === "admin") {
    return NextResponse.json({
      destination: "/admin/dashboard",
    });
  }

  if (profile.role === "employee") {
    return NextResponse.json({
      destination: "/employee/dashboard",
    });
  }

  return NextResponse.json(
    { error: "Invalid account role" },
    { status: 403 }
  );
}
