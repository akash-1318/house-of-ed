import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="text-sm text-slate-600">Loading...</div>}
    >
      <LoginClient />
    </Suspense>
  );
}
