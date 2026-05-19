import { useCallback, useMemo, useState } from "react";
import { createGuardApi } from "../api/guard";
import type { GuardApiConfig } from "../api/guard";

export function useGuardQueue(api: GuardApiConfig, buildingId: string | null | undefined) {
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const guard = useMemo(() => createGuardApi(api), [api]);

  const refresh = useCallback(async () => {
    if (!buildingId) return;
    setLoading(true);
    try {
      const data = await guard.getQueue(buildingId);
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [buildingId, guard]);

  return { items, loading, refresh };
}
