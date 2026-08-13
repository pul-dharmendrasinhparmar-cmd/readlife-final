"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  bindGuestStorage,
  bindUserStorage,
  getStorageScope,
  type StorageScope,
} from "@/lib/user-storage";

type StorageScopeValue = {
  scope: StorageScope;
  ready: boolean;
};

const StorageScopeContext = createContext<StorageScopeValue>({
  scope: "guest",
  ready: false,
});

export function useStorageScope() {
  return useContext(StorageScopeContext);
}

/**
 * Keeps localStorage scope aligned with Auth.js session.
 * Remounts the tree when scope changes so pages reload empty/user data
 * instead of stale guest demo state.
 */
export function UserStorageSync({ children }: { children: ReactNode }) {
  const { data, status } = useSession();
  const [scope, setScope] = useState<StorageScope>(() => getStorageScope());
  const ready = status !== "loading";

  useEffect(() => {
    if (status === "loading") return;
    if (data?.user?.id) {
      bindUserStorage({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      });
      setScope(data.user.id);
    } else {
      bindGuestStorage();
      setScope("guest");
    }
  }, [status, data?.user?.id, data?.user?.name, data?.user?.email]);

  const value = useMemo(() => ({ scope, ready }), [scope, ready]);

  return (
    <StorageScopeContext.Provider value={value}>
      <div key={scope} className="contents">
        {children}
      </div>
    </StorageScopeContext.Provider>
  );
}
