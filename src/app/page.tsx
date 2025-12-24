export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">StudyHub</h1>
      <p className="text-slate-700">
        Register, login, manage study tasks, and attach notes.
      </p>
      <div className="flex gap-3 flex-wrap">
        <a
          className="px-4 py-2 rounded bg-slate-900 text-white no-underline"
          href="/register"
        >
          Create account
        </a>
        <a
          className="px-4 py-2 text-slate-500 rounded border no-underline"
          href="/login"
        >
          Login
        </a>
        <a
          className="px-4 py-2 text-slate-500 rounded border no-underline"
          href="/dashboard/tasks"
        >
          Go to dashboard
        </a>
      </div>
    </div>
  );
}
