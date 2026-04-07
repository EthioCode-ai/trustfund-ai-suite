import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correctPassword = process.env.EXEC_PASSWORD;

  if (!correctPassword) {
    // No password set = no auth required
    return NextResponse.json({ success: true });
  }

  if (password === correctPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("exec-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const correctPassword = process.env.EXEC_PASSWORD;

  // No password set = always authenticated
  if (!correctPassword) {
    return NextResponse.json({ authenticated: true });
  }

  const cookie = req.cookies.get("exec-auth");
  return NextResponse.json({ authenticated: cookie?.value === "authenticated" });
}
