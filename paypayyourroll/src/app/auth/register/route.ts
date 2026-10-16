
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const employeeId =
      typeof body.employeeId === "string" ? body.employeeId.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!fullName || !employeeId || !email || password.length < 8) {
      return NextResponse.json(
        { error: "Provide all fields and a password of at least 8 characters." },
        { status: 400 }
      );
    }

    // TODO: Validate employeeId against an authorized employee roster here.
    // Do not deploy public registration until this check is implemented.

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName },
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Account creation failed." },
        { status: 400 }
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: fullName,
        employee_id: employeeId,
      })
      .eq("id", data.user.id);

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);

      return NextResponse.json(
        { error: "Unable to create the employee profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Account created. Check your email if confirmation is required before signing in.",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
