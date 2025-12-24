"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ApiError = { error: string };

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const body: any = { title, subject, description, priority };
      if (dueDate) body.dueDate = new Date(dueDate).toISOString();

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(data?.error ?? "Failed to create task");
      }
      const json = (await res.json()) as { id: string };
      router.push(`/dashboard/tasks/${json.id}`);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New task</h1>
        <a className="text-sm" href="/dashboard/tasks">Back</a>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm">Title</label>
          <input className="w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Subject</label>
          <input className="w-full border rounded px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Description</label>
          <textarea className="w-full border rounded px-3 py-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm">Due date</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Priority</label>
            <select className="w-full border rounded px-3 py-2" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
        </div>
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button disabled={loading} className="px-4 py-2 rounded bg-slate-900 text-white">
          {loading ? "Saving..." : "Create"}
        </button>
      </form>
    </div>
  );
}
