"use client";

import { useCallback, useEffect, useState } from "react";
import { businessApi, getActiveUser, listenForStoreChanges } from "./businessStore";

export function useBusinessData() {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const activeUser = getActiveUser();
    setUser(activeUser);

    if (!activeUser) {
      setDashboard(null);
      setLoading(false);
      return;
    }

    try {
      setError("");
      const data = await businessApi.getDashboard(activeUser.id);
      setDashboard(data);
    } catch (err) {
      setError(err.message || "Could not load business data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return listenForStoreChanges(refresh);
  }, [refresh]);

  return { user, dashboard, loading, error, refresh };
}
