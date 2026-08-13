"use client";

import { Suspense } from "react";
import { LibraryPage } from "@/components/library/library-page";

export default function LibraryRoutePage() {
  return (
    <Suspense fallback={null}>
      <LibraryPage />
    </Suspense>
  );
}
