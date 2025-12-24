import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireUser } from "@/app/lib/route-helpers";
import { connectDB } from "@/app/lib/db";
import { Note } from "@/app/models/Note";

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const { user, error } = await requireUser();
  if (error) return error;

const { id } = await (ctx.params as any);
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await connectDB();
  const deleted = await Note.deleteOne({ _id: id, userId: user!.id });
  if (deleted.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
