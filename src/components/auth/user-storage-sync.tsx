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
  clearUserDataStorageHook,
  hydrateUserDataFromServer,
  installUserDataStorageHook,
  pushUserDataToServer,
  scheduleUserDataPush,
} from "@/lib/user-data-client";
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
 * For signed-in users: hydrate from GET /api/user/data, then debounced PUT
 * when user-scoped keys change. Guests stay local-only (demo seed).
 */
export function UserStorageSync({ children }: { children: ReactNode }) {
  const { data, status } = useSession();
  const [scope, setScope] = useState<StorageScope>(() => getStorageScope());
  const [ready, setReady] = useState(false);
  const [treeKey, setTreeKey] = useState(0);

  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;

    async function syncScope() {
      setReady(false);

      if (data?.user?.id) {
        const userId = data.user.id;
        bindUserStorage({
          id: userId,
          name: data.user.name,
          email: data.user.email,
        });
        if (!cancelled) setScope(userId);

        const result = await hydrateUserDataFromServer(userId);
        if (cancelled) return;

        installUserDataStorageHook(userId, () => {
          scheduleUserDataPush(userId);
        });

        // Server empty → upload current clean slate / local writes (never guest).
        if (result === "local" || result === "error") {
          void pushUserDataToServer(userId);
        }

        setTreeKey((k) => k + 1);
        setReady(true);
        return;
      }

      // Leaving a signed-in session: flush before dropping to guest.
      const previous = getStorageScope();
      if (previous !== "guest") {
        await pushUserDataToServer(previous);
      }
      clearUserDataStorageHook();
      bindGuestStorage();
      if (!cancelled) {
        setScope("guest");
        setTreeKey((k) => k + 1);
        setReady(true);
      }
    }

    void syncScope();

    return () => {
      cancelled = true;
    };
  }, [status, data?.user?.id, data?.user?.name, data?.user?.email]);

  // Flush pending saves on tab hide / unload.
  useEffect(() => {
    if (!ready || scope === "guest") return;

    const flush = () => {
      void pushUserDataToServer(scope);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ready, scope]);

  const value = useMemo(() => ({ scope, ready }), [scope, ready]);

  return (
    <StorageScopeContext.Provider value={value}>
      <div key={`${scope}:${treeKey}`} className="contents">
        {children}
      </div>
    </StorageScopeContext.Provider>
  );
}
