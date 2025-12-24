"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiError = { error: string };

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(data?.error ?? "Registration failed");
      }
      router.push("/dashboard/tasks");
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-slate-500">Minimum 6 characters.</p>
        </div>
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button disabled={loading} className="px-4 py-2 rounded bg-slate-900 text-white">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="text-sm text-slate-600">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}
