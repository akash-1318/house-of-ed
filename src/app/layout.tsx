import Footer from "./components/Footer";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StudyHub",
  description: "A simple study planner with tasks and notes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh flex flex-col">
          <header className="border-b">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
              <a href="/" className="font-semibold text-slate-900 no-underline">
                StudyHub
              </a>
              <nav className="text-sm flex gap-4 text-slate-900">
                <a href="/dashboard/tasks">Dashboard</a>
                <a href="/login">Login</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8 w-full flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
