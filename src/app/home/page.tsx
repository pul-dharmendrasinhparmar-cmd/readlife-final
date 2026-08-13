import type { Metadata } from "next";
import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Home — ReadLife",
  description: "Your cozy reading dashboard.",
};

export default function HomeDashboardPage() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}
