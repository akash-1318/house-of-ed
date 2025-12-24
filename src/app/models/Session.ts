import mongoose, { Schema, type InferSchemaType } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export type SessionDoc = InferSchemaType<typeof SessionSchema> & { _id: mongoose.Types.ObjectId };

export const Session = mongoose.models.Session ?? mongoose.model("Session", SessionSchema);
