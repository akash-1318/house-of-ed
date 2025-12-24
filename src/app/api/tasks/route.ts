import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireUser } from "@/app/lib/route-helpers";
import { connectDB } from "@/app/lib/db";
import { Task } from "@/app/models/Task";
import { taskCreateSchema } from "@/app/lib/validators";

export async function GET(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;

  await connectDB();
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "10")));

  const filter: any = { userId: new mongoose.Types.ObjectId(user!.id) };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } }
    ];
  }

  const total = await Task.countDocuments(filter);
  const items = await Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean();

  return NextResponse.json({
    items: items.map((t: any) => ({
      _id: String(t._id),
      title: t.title,
      subject: t.subject,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
      createdAt: new Date(t.createdAt).toISOString()
    })),
    page,
    pageSize,
    total
  });
}

export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;

  await connectDB();
  const body = await req.json().catch(() => null);
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const created = await Task.create({
    userId: new mongoose.Types.ObjectId(user!.id),
    title: parsed.data.title,
    subject: parsed.data.subject,
    description: parsed.data.description ?? "",
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    priority: parsed.data.priority
  });

  return NextResponse.json({ id: String(created._id) }, { status: 201 });
}
