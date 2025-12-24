import crypto from "crypto";
import { cookies } from "next/headers";
import { connectDB } from "./db";
import { Session } from "../models/Session";

const COOKIE_NAME = "studyhub_session";

export type SessionUser = { id: string };

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  await connectDB();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({ userId, tokenHash, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function destroySession(): Promise<void> {
  await connectDB();
    const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = sha256(token);
    await Session.deleteOne({ tokenHash });
  }
  cookieStore.set(COOKIE_NAME, "", { path: "/", expires: new Date(0) });
}

type SessionLean = { userId: string; expiresAt: Date; _id: unknown };

export async function getSessionUser(): Promise<SessionUser | null> {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = sha256(token);
  const session = await Session.findOne({ tokenHash })
    .lean<SessionLean | null>()
    .exec();
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await Session.deleteOne({ _id: session._id });
    return null;
  }

  return { id: String(session.userId) };
}
