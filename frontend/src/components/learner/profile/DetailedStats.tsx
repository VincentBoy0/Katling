import { Card } from "@/components/ui/card";
import { useSummary } from "@/hooks/useSummary";
import { leaderboardService } from "@/services/leaderboardService";
import { Flame, Target, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function DetailedStats() {
  const { summary, loading } = useSummary();
  const [xpRank, setXpRank] = useState<number | null>(null);
  const [streakRank, setStreakRank] = useState<number | null>(null);
  const [rankLoading, setRankLoading] = useState(true);

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const [xpRes, streakRes] = await Promise.all([
          leaderboardService.getMyRank("xp", "all"),
          leaderboardService.getMyRank("streak", "all"),
        ]);
        setXpRank(xpRes.rank);
        setStreakRank(streakRes.rank);
      } catch {
        setXpRank(null);
        setStreakRank(null);
      } finally {
        setRankLoading(false);
      }
    };
    fetchRanks();
  }, []);

  if (loading) return <p>Đang tải...</p>;
  if (!summary) return null;

  return (
    <>
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Target className="w-6 h-6 text-primary" />
        Thành tích
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <Card className="p-5 flex flex-col items-center justify-center gap-3 border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl text-center">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600">
            <Flame className="w-7 h-7 orange-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-orange-700 dark:text-orange-500">
              {summary.streak} ngày
            </p>
          </div>
        </Card>
        {/* XP */}
        <Card className="p-5 flex flex-col items-center justify-center gap-3 border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl text-center">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
            <Zap className="w-7 h-7 emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-500">
              {summary.xp} XP
            </p>
          </div>
        </Card>
        {/* XP Rank */}
        <Card className="p-5 flex flex-col items-center justify-center gap-3 border-2 border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-2xl text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600">
            <Trophy className="w-7 h-7 yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              XP
            </p>
            <p className="text-2xl font-black text-yellow-700 dark:text-yellow-500">
              {rankLoading ? "..." : xpRank ? `Top ${xpRank}` : "Chưa xếp hạng"}
            </p>
          </div>
        </Card>
        {/* Streak Rank */}
        <Card className="p-5 flex flex-col items-center justify-center gap-3 border-2 border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl text-center">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600">
            <Trophy className="w-7 h-7 rose-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              Streak
            </p>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-500">
              {rankLoading
                ? "..."
                : streakRank
                ? `Top ${streakRank}`
                : "Chưa xếp hạng"}
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
