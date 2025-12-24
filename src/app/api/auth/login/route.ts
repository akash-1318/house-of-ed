import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import { createSession } from "@/app/lib/auth";
import { loginSchema } from "@/app/lib/validators";
import { User } from "@/app/models/User";

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  await createSession(String(user._id));
  return NextResponse.json({ ok: true });
}
