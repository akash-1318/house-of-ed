"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Task = {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  dueDate?: string;
};

type Note = { _id: string; content: string; createdAt: string };

type DetailResponse = { task: Task; notes: Note[] };

type ApiError = { error: string };

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      console.log("hello");
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) throw new Error("Failed to load task");
      const json = (await res.json()) as DetailResponse;
      setData(json);

      setTitle(json.task.title);
      setSubject(json.task.subject);
      setDescription(json.task.description ?? "");
      setPriority(json.task.priority);
      setStatus(json.task.status);
      setDueDate(
        json.task.dueDate
          ? new Date(json.task.dueDate).toISOString().slice(0, 10)
          : ""
      );
    } catch (e: any) {
      setErr(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function addNote() {
    if (!note.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/tasks/${id}/notes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: note }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(j?.error ?? "Failed to add note");
      }
      setNote("");
      await load();
    } catch (e: any) {
      alert(e.message ?? "Error");
    } finally {
      setSavingNote(false);
    }
  }

  async function deleteNote(noteId: string) {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  async function saveEdits() {
    const body: any = { title, subject, description, priority, status };
    if (dueDate) body.dueDate = new Date(dueDate).toISOString();
    else body.dueDate = null;

    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as ApiError | null;
      alert(j?.error ?? "Failed to update");
      return;
    }
    setEditMode(false);
    await load();
  }

  async function deleteTask() {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/tasks");
      router.refresh();
    }
  }

  if (loading && !data) return <p>Loading...</p>;
  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!data) return null;

  const t = data.task;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-sm text-slate-600">{t.subject}</p>
        </div>
        <div className="flex gap-2">
          <a
            className="px-3 py-2 rounded border no-underline"
            href="/dashboard/tasks"
          >
            Back
          </a>
          <button
            className="px-3 py-2 rounded border"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
          <button
            className="px-3 py-2 rounded bg-red-600 text-white"
            onClick={deleteTask}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="border rounded p-4 space-y-3">
        {!editMode ? (
          <>
            <p className="text-slate-700 whitespace-pre-wrap">
              {t.description || "No description"}
            </p>
            <div className="text-sm text-slate-600">
              Status: <span className="font-medium">{t.status}</span> ·
              Priority: <span className="font-medium">{t.priority}</span>
              {t.dueDate ? (
                <>
                  {" "}
                  · Due:{" "}
                  <span className="font-medium">
                    {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                </>
              ) : null}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm">Title</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm">Subject</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm">Due date</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm">Priority</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm">Status</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="todo">todo</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                </select>
              </div>
            </div>
            <button
              className="px-4 py-2 rounded bg-slate-900 text-white"
              onClick={saveEdits}
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Notes</h2>
        <div className="flex gap-2">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Write a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            disabled={savingNote}
            onClick={addNote}
            className="px-3 py-2 rounded bg-slate-900 text-white"
          >
            {savingNote ? "Adding..." : "Add"}
          </button>
        </div>

        <div className="space-y-2">
          {data.notes.length === 0 ? (
            <p className="text-sm text-slate-600">No notes yet.</p>
          ) : null}
          {data.notes.map((n) => (
            <div
              key={n._id}
              className="border rounded p-3 flex items-start justify-between gap-3"
            >
              <div>
                <div className="text-slate-800 whitespace-pre-wrap">
                  {n.content}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                className="text-sm text-red-600"
                onClick={() => deleteNote(n._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
