import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/learner/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import {
  Crown,
  Flame,
  Locate,
  Medal,
  Minus,
  MoveDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useCallback, useRef } from "react";

const getRankVisuals = (rank?: number | null) => {
  if (!rank || rank <= 0) {
    return {
      icon: <span className="text-xs font-bold text-muted-foreground">—</span>,
      bg: "bg-card",
      border: "border-border",
      text: "text-muted-foreground",
      badge: "bg-muted text-muted-foreground",
    };
  }

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
  const {
    xpLeaderboard,
    streakLeaderboard,
    myXpRank,
    myStreakRank,
    isLoading,
    error,
  } = useLeaderboard();

  const myStreakItemRef = useRef<HTMLDivElement>(null);
  const myXpItemRef = useRef<HTMLDivElement>(null);

  const scrollToMyRank = useCallback((type: "streak" | "xp") => {
    const ref = type === "streak" ? myStreakItemRef : myXpItemRef;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const LeaderboardItem = ({
    user,
    unit,
    icon,
    isMe,
    itemRef,
  }: {
    user: any;
    unit: string;
    icon: React.ReactNode;
    isMe?: boolean;
    itemRef?: React.RefObject<HTMLDivElement>;
  }) => {
    const visuals = getRankVisuals(user.rank);

    return (
      <div
        ref={itemRef}
        className={`
        flex items-center justify-between p-4 rounded-2xl
        border-2 transition-all hover:-translate-y-0.5
        ${visuals.bg} ${visuals.border}
        ${isMe ? "ring-2 ring-primary ring-offset-2" : ""}
      `}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Rank Icon */}
          <div className="w-8 flex justify-center shrink-0">{visuals.icon}</div>

          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm shrink-0 ${
              user.avatarColor || "bg-gray-100"
            } ${isMe ? "ring-2 ring-primary" : ""}`}
          >
            {user.name?.charAt(0) || "?"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p
              className={`font-bold text-sm md:text-base truncate ${
                isMe ? "text-primary" : visuals.text
              }`}
            >
              {user.name}
              {isMe && (
                <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                  Bạn
                </span>
              )}
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
            {user.change > 0 && (
              <TrendingUp className="w-5 h-5 text-green-500" />
            )}
            {user.change < 0 && (
              <MoveDown className="w-5 h-5 text-muted-foreground/50" />
            )}
            {(user.change === 0 || user.change === null) && (
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

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-2xl p-4 border-2 border-orange-100 dark:border-orange-900 text-center">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
              Streak
            </p>
            <p className="text-2xl font-black text-foreground">
              #{myStreakRank?.rank ?? "--"}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              #{myStreakRank?.streak ?? "--"} ngày
            </p>
          </div>
          <div className="bg-background rounded-2xl p-4 border-2 border-emerald-100 dark:border-emerald-900 text-center">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
              Kinh nghiệm
            </p>
            <p className="text-2xl font-black text-foreground">
              #{myXpRank?.rank ?? "--"}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {myXpRank?.xp ?? "--"} XP
            </p>
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

        {error && <p className="text-center text-red-500 font-bold">{error}</p>}

        <Tabs defaultValue="streak" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl mb-6">
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
            value="streak"
            className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToMyRank("streak")}
                className="gap-2"
              >
                <Locate className="w-4 h-4" />
                Vị trí của tôi
              </Button>
            </div>
            {streakLeaderboard?.map((user) => (
              <LeaderboardItem
                key={user.user_id}
                user={{
                  rank: user.rank,
                  name: user.username ?? "Katlinger",
                  value: user.streak,
                  change: user.rank_change,
                }}
                unit="Streak"
                icon={<Flame className="w-4 h-4 text-orange-500" />}
                isMe={user.is_me}
                itemRef={user.is_me ? myStreakItemRef : undefined}
              />
            ))}
          </TabsContent>

          <TabsContent
            value="xp"
            className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToMyRank("xp")}
                className="gap-2"
              >
                <Locate className="w-4 h-4" />
                Tìm vị trí của tôi
              </Button>
            </div>
            {xpLeaderboard?.map((user) => (
              <LeaderboardItem
                key={user.user_id}
                user={{
                  rank: user.rank,
                  name: user.username ?? "Katlinger",
                  value: user.xp,
                  change: user.rank_change,
                }}
                unit="XP"
                icon={<Zap className="w-4 h-4 text-emerald-500" />}
                isMe={user.is_me}
                itemRef={user.is_me ? myXpItemRef : undefined}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
