import { Card } from "@/components/ui/card";
import { useUserPoints } from "@/hooks/useUserPoints";
import { Flame, Target, Trophy, Zap } from "lucide-react";

export default function DetailedStats() {
  const { data, loading } = useUserPoints();

  if (loading) return <p>Đang tải...</p>;
  if (!data) return null;

  return (
    <>
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Target className="w-6 h-6 text-primary" />
        Thành tích
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak */}
        <Card className="p-5 flex items-center gap-4 border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600">
            <Flame className="w-7 h-7 orange-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-orange-700 dark:text-orange-500">
              {data.streak} ngày
            </p>
          </div>
        </Card>
        {/* XP */}
        <Card className="p-5 flex items-center gap-4 border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
            <Zap className="w-7 h-7 emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-500">
              {data.xp} XP
            </p>
          </div>
        </Card>
        {/* Rank */}
        <Card className="p-5 flex items-center gap-4 border-2 border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-2xl">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600">
            <Trophy className="w-7 h-7 yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-yellow-700 dark:text-yellow-500">
              Top 10
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
