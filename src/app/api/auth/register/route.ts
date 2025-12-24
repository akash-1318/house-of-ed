import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import { registerSchema } from "@/app/lib/validators";
import { User } from "@/app/models/User";
import { createSession } from "@/app/lib/auth";

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await User.findOne({ email }).lean();
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({ email, passwordHash });

  await createSession(String(user._id));
  return NextResponse.json({ ok: true }, { status: 201 });
}
