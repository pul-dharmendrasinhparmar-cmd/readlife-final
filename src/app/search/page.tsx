import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "@/components/search/search-page";

export const metadata: Metadata = {
  title: "Discover — ReadLife",
  description:
    "Find your next story, your reading people, or something fun between chapters.",
};

export default function SearchRoutePage() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
