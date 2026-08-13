"use client";

import { useParams } from "next/navigation";
import { BookPage } from "@/components/book/book-page";

export default function BookRoutePage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return <BookPage bookId={id ?? ""} />;
}
