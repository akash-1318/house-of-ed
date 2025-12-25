import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireUser } from "@/app/lib/route-helpers";
import { connectDB } from "@/app/lib/db";
import { noteCreateSchema } from "@/app/lib/validators";
import { Task } from "@/app/models/Task";
import { Note } from "@/app/models/Note";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id: taskId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();

  const body = await req.json().catch(() => null);
  const parsed = noteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const task = await Task.findOne({
    _id: taskId,
    userId: user!.id
  }).lean();

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await Note.create({
    taskId: new mongoose.Types.ObjectId(taskId),
    userId: new mongoose.Types.ObjectId(user!.id),
    content: parsed.data.content
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
