"use client";

import { Suspense } from "react";
import { ProfilePageView } from "@/components/profile/profile-page";

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageView />
    </Suspense>
  );
}
