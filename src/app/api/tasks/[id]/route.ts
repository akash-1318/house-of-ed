import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireUser } from "@/app/lib/route-helpers";
import { connectDB } from "@/app/lib/db";
import { Task } from "@/app/models/Task";
import { Note } from "@/app/models/Note";
import { taskUpdateSchema } from "@/app/lib/validators";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();

  const task = await Task.findOne({ _id: id, userId: user!.id }).lean();
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const notes = await Note.find({ taskId: id, userId: user!.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    task: {
      _id: String(task._id),
      title: task.title,
      subject: task.subject,
      description: task.description ?? "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
      priority: task.priority,
      status: task.status
    },
    notes: notes.map((n: any) => ({
      _id: String(n._id),
      content: n.content,
      createdAt: new Date(n.createdAt).toISOString()
    }))
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();

  const body = await req.json().catch(() => null);
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const update: any = {};
  if (typeof parsed.data.title === "string") update.title = parsed.data.title;
  if (typeof parsed.data.subject === "string") update.subject = parsed.data.subject;
  if (typeof parsed.data.description === "string") update.description = parsed.data.description;
  if (typeof parsed.data.priority === "string") update.priority = parsed.data.priority;
  if (typeof parsed.data.status === "string") update.status = parsed.data.status;
  if (parsed.data.dueDate === null) update.dueDate = null;
  if (typeof parsed.data.dueDate === "string") {
    update.dueDate = new Date(parsed.data.dueDate);
  }

  const updated = await Task.findOneAndUpdate(
    { _id: id, userId: user!.id },
    { $set: update },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();

  const deleted = await Task.deleteOne({ _id: id, userId: user!.id });
  await Note.deleteMany({ taskId: id, userId: user!.id });

  if (deleted.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
