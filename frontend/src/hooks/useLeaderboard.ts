import { useEffect, useState } from "react";
import { leaderboardService } from "@/services/leaderboardService";
import type {
  LeaderboardItem,
  MyLeaderboardResponse,
} from "@/types/leaderboard";

export function useLeaderboard() {
  const [xpLeaderboard, setXpLeaderboard] =
    useState<LeaderboardItem[]>([]);

  const [streakLeaderboard, setStreakLeaderboard] =
    useState<LeaderboardItem[]>([]);

  const [myXpRank, setMyXpRank] =
    useState<MyLeaderboardResponse | null>(null);

  const [myStreakRank, setMyStreakRank] =
    useState<MyLeaderboardResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);

        const [
          xpList,
          streakList,
          myXp,
          myStreak,
        ] = await Promise.all([
          leaderboardService.getLeaderboard({ type: "xp" }),
          leaderboardService.getLeaderboard({ type: "streak" }),
          leaderboardService.getMyRank("xp"),
          leaderboardService.getMyRank("streak"),
        ]);

        setXpLeaderboard(xpList);
        setStreakLeaderboard(streakList);
        setMyXpRank(myXp);
        setMyStreakRank(myStreak);
      } catch {
        setError("Không tải được bảng xếp hạng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  return {
    xpLeaderboard,
    streakLeaderboard,
    myXpRank,
    myStreakRank,
    isLoading,
    error,
  };
}
