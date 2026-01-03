import { useEffect, useState } from "react";
import { leaderboardService } from "@/services/leaderboardService";
import type {
  LeaderboardResponse,
  MyLeaderboardRank,
} from "@/services/leaderboardService";



import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/learner/tabs";
import { Card } from "@/components/ui/card";
import {
  Crown,
  Flame,
  Medal,
  Minus,
  MoveDown,
  TrendingUp,
  Zap,
} from "lucide-react";

// Helper để lấy icon và style cho Rank
const getRankVisuals = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        icon: <Crown className="w-6 h-6 fill-yellow-500 text-yellow-600" />,
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
        border: "border-yellow-300 dark:border-yellow-700",
        text: "text-yellow-700 dark:text-yellow-500",
        badge: "bg-yellow-100 text-yellow-700",
      };
    case 2:
      return {
        icon: <Medal className="w-6 h-6 fill-slate-300 text-slate-500" />,
        bg: "bg-slate-50 dark:bg-slate-950/20",
        border: "border-slate-300 dark:border-slate-700",
        text: "text-slate-700 dark:text-slate-400",
        badge: "bg-slate-100 text-slate-700",
      };
    case 3:
      return {
        icon: <Medal className="w-6 h-6 fill-orange-300 text-orange-600" />,
        bg: "bg-orange-50 dark:bg-orange-950/20",
        border: "border-orange-300 dark:border-orange-700",
        text: "text-orange-700 dark:text-orange-500",
        badge: "bg-orange-100 text-orange-700",
      };
    default:
      return {
        icon: (
          <span className="text-sm font-bold text-muted-foreground">
            #{rank}
          </span>
        ),
        bg: "bg-card",
        border: "border-border",
        text: "text-foreground",
        badge: "bg-muted text-muted-foreground",
      };
  }
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [myRank, setMyRank] = useState<MyLeaderboardRank | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const [lb, me] = await Promise.all([
          leaderboardService.getLeaderboard(),
          leaderboardService.getMyRank(),
        ]);

        setLeaderboard(lb);
        setMyRank(me);
      } catch (e) {
        setError("Không tải được bảng xếp hạng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);


  const LeaderboardItem = ({
    user,
    unit,
    icon,
  }: {
    user: any;
    unit: string;
    icon: React.ReactNode;
  }) => {
    const visuals = getRankVisuals(user.rank);

    return (
      <div
        className={`
        flex items-center justify-between p-4 rounded-2xl
        border-2 transition-all hover:-translate-y-0.5
        ${visuals.bg} ${visuals.border}
      `}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Rank Icon */}
          <div className="w-8 flex justify-center shrink-0">{visuals.icon}</div>

          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm shrink-0 ${
              user.avatarColor || "bg-gray-100"
            }`}
          >
            {user.name.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p
              className={`font-bold text-sm md:text-base truncate ${visuals.text}`}
            >
              {user.name}
            </p>
            <div className="flex items-center gap-1 md:hidden">
              <span className="text-xs font-bold text-muted-foreground">
                {user.value} {unit}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Right */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Value (Desktop) */}
          <div className="hidden md:flex items-center gap-2 font-black text-lg text-foreground/80">
            {icon}
            <span>
              {user.value}{" "}
              <span className="text-xs font-bold text-muted-foreground uppercase">
                {unit}
              </span>
            </span>
          </div>

          {/* Trend Indicator */}
          <div className="w-8 flex justify-end">
            {user.change === "up" && (
              <TrendingUp className="w-5 h-5 text-green-500" />
            )}
            {user.change === "down" && (
              <MoveDown className="w-5 h-5 text-muted-foreground/50" />
            )}{" "}
            {/* Dùng xám thay vì đỏ */}
            {user.change === "same" && (
              <Minus className="w-5 h-5 text-muted-foreground/30" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto min-h-screen">
      {/* 1. HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          Bảng xếp hạng
        </h1>
        <p className="text-muted-foreground font-medium text-lg">
          Thi đua cùng cộng đồng học tập Katling.
        </p>
      </div>

      {/* 2. YOUR POSITION CARD */}
      <Card className="p-6 border-2 border-primary/30 bg-primary/5 rounded-3xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm">
            B
          </div>
          <div>
            <h3 className="font-bold text-lg text-primary">Thứ hạng của Bạn</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Bạn đang làm rất tốt!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background rounded-2xl p-4 border-2 border-indigo-100 dark:border-indigo-900 text-center">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
              Cấp độ
            </p>
            <p className="text-2xl font-black text-foreground">#{myRank?.level.rank ?? "--"}</p>
            <p className="text-xs text-muted-foreground font-medium">LVL {myRank?.level.value ?? "--"}</p>
          </div>
          <div className="bg-background rounded-2xl p-4 border-2 border-orange-100 dark:border-orange-900 text-center">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
              Streak
            </p>
            <p className="text-2xl font-black text-foreground">#{myRank?.streak.rank ?? "--"}</p>
            <p className="text-xs text-muted-foreground font-medium">#{myRank?.streak.value ?? "--"} ngày</p>
          </div>
          <div className="bg-background rounded-2xl p-4 border-2 border-emerald-100 dark:border-emerald-900 text-center">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
              Kinh nghiệm
            </p>
            <p className="text-2xl font-black text-foreground">#{myRank?.xp.rank ?? "--"}</p>
            <p className="text-xs text-muted-foreground font-medium">{myRank?.xp.value ?? "--"} XP</p>
          </div>
        </div>
      </Card>

      {/* 3. LEADERBOARD LIST */}
      <div className="space-y-6">
        {isLoading && (
          <p className="text-center text-muted-foreground">
            Đang tải bảng xếp hạng...
          </p>
        )}

        {error && (
          <p className="text-center text-red-500 font-bold">
            {error}
          </p>
        )}

        <Tabs
          defaultValue="level"
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl mb-6">
            <TabsTrigger
              value="level"
              className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
            >
              <Crown className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cấp độ</span>
            </TabsTrigger>
            <TabsTrigger
              value="streak"
              className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm transition-all"
            >
              <Flame className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Streak</span>
            </TabsTrigger>
            <TabsTrigger
              value="xp"
              className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-500 data-[state=active]:shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Kinh nghiệm</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="level"
            className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {leaderboard?.level.map((user) => (
              <LeaderboardItem
                key={user.rank}
                user={{
                  ...user,
                  change: user.rank_change,
                }}
                unit="Level"
                icon={<Crown className="w-4 h-4 text-indigo-500" />}
              />
            ))}
          </TabsContent>

          <TabsContent
            value="streak"
            className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {leaderboard?.streak.map((user) => (
              <LeaderboardItem
                key={user.rank}
                user={{
                  ...user,
                  change: user.rank_change,
                }}
                unit="Streak"
                icon={<Flame className="w-4 h-4 text-orange-500" />}
              />
            ))}
          </TabsContent>

          <TabsContent
            value="xp"
            className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {leaderboard?.xp.map((user) => (
              <LeaderboardItem
                key={user.rank}
                user={{
                  ...user,
                  change: user.rank_change,
                }}
                unit="XP"
                icon={<Zap className="w-4 h-4 text-emerald-500" />}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
