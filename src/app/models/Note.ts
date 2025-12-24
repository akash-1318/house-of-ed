import mongoose, { Schema, type InferSchemaType } from "mongoose";

const NoteSchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export type NoteDoc = InferSchemaType<typeof NoteSchema> & { _id: mongoose.Types.ObjectId };

export const Note = mongoose.models.Note ?? mongoose.model("Note", NoteSchema);
