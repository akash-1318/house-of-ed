"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  _id: string;
  title: string;
  subject: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  dueDate?: string;
  createdAt: string;
};

type ListResponse = {
  items: Task[];
  page: number;
  pageSize: number;
  total: number;
};

export default function TasksPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    sp.set("page", String(page));
    sp.set("pageSize", String(pageSize));
    return sp.toString();
  }, [q, page]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/tasks?${queryString}`);
        if (!res.ok) throw new Error("Failed to load tasks");
        const json = (await res.json()) as ListResponse;
        if (!ignore) setData(json);
      } catch (e: any) {
        if (!ignore) setErr(e.message ?? "Error");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [queryString]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Your tasks</h1>
          <p className="text-sm text-slate-600">
            Search, create, update, and track your study plan.
          </p>
        </div>
        <div className="flex gap-2 text-slate-600">
          <a
            className="px-3 py-2 rounded border no-underline"
            href="/dashboard/tasks/new"
          >
            New task
          </a>
          <button
            onClick={logout}
            className="px-3 py-2 rounded bg-slate-900 text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <input
        className="w-full border rounded px-3 py-2 text-slate-600"
        placeholder="Search by title/subject..."
        value={q}
        onChange={(e) => {
          setPage(1);
          setQ(e.target.value);
        }}
      />

      {loading ? <p>Loading...</p> : null}
      {err ? <p className="text-sm text-red-600">{err}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {data?.items?.map((t) => (
          <a
            key={t._id}
            href={`/dashboard/tasks/${t._id}`}
            className="border rounded p-4 no-underline hover:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-900">{t.title}</div>
                <div className="text-sm text-slate-600">{t.subject}</div>
              </div>
              <div className="text-xs text-slate-600">{t.status}</div>
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Priority: {t.priority}
              {t.dueDate
                ? ` · Due: ${new Date(t.dueDate).toLocaleDateString()}`
                : ""}
            </div>
          </a>
        ))}
      </div>

      {data && data.total > pageSize ? (
        <div className="flex items-center justify-between">
          <button
            className="px-3 py-2 rounded border disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <div className="text-sm text-slate-600">
            Page {data.page} · Total {data.total}
          </div>
          <button
            className="px-3 py-2 rounded border disabled:opacity-50"
            disabled={page * pageSize >= data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
