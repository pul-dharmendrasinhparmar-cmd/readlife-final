"use client";

import { SessionProvider } from "next-auth/react";
import { UserStorageSync } from "@/components/auth/user-storage-sync";

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <UserStorageSync>{children}</UserStorageSync>
    </SessionProvider>
  );
}
