export default function Footer() {
  return (
    <footer className="border-t mt-10 py-6 text-sm text-slate-800">
      <div className="mx-auto max-w-5xl px-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-medium text-slate-800">Akash Sharma</span> ·
          StudyHub Assignment
        </div>
        <div className="flex gap-4">
          <a
            href="https://github.com/akash-1318"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/akash-sharma-0251051a1/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
