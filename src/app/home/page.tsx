import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Home — ReadLife",
  description: "Your cozy reading dashboard.",
};

export default function HomeDashboardPage() {
  return <Dashboard />;
}
