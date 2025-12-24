import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User = mongoose.models.User ?? mongoose.model("User", UserSchema);
