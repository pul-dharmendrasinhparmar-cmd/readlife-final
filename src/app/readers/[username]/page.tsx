"use client";

import { useParams } from "next/navigation";
import { VisitorProfileView } from "@/components/profile/visitor-profile";

export default function ReaderProfilePage() {
  const params = useParams<{ username: string }>();
  return <VisitorProfileView username={params.username} />;
}
