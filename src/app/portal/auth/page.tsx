"use client";

import { Suspense } from "react";
import PortalAuthForm from "./PortalAuthForm";

export default function PortalAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-navy">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <PortalAuthForm />
    </Suspense>
  );
}
