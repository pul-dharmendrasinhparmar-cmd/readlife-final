import type { Metadata } from "next";
import { InsightsPage } from "@/components/insights/insights-page";

export const metadata: Metadata = {
  title: "Insights — ReadLife",
  description:
    "See the story behind your reading — habits, patterns, milestones, and Reader DNA.",
};

export default function InsightsRoutePage() {
  return <InsightsPage />;
}
