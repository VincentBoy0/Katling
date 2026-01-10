import { useEffect, useState, useCallback } from "react";
import { userService } from "@/services/userService";
import { UserSummary } from "@/types/user";

export function useSummary() {
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getSummary();
      setSummary(res.data);
      setError(null);
    } catch {
      setError("Unable to fetch summary");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refetchSummary = useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetchSummary };
}
