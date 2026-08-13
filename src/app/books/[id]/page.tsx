"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { BookPage } from "@/components/book/book-page";

function BookRouteInner() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return <BookPage bookId={id ?? ""} />;
}

export default function BookRoutePage() {
  return (
    <Suspense fallback={null}>
      <BookRouteInner />
    </Suspense>
  );
}
