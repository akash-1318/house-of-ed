import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set. Add it to your .env file.");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache: MongooseCache = (globalThis as any).mongooseCache ?? { conn: null, promise: null };
(globalThis as any).mongooseCache = globalCache;

export async function connectDB(): Promise<typeof mongoose> {
  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(MONGODB_URI!, { bufferCommands: false });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
