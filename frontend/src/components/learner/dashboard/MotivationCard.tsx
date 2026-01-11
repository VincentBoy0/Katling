import { Card } from "@/components/ui/card";
import { UserSummary } from "@/types/user";
import {
  Award,
  Calendar,
  Flame,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo } from "react";

interface MotivationCardProps {
  summary: UserSummary | null;
}

const motivationalQuotes = [
  {
    quote: "Mỗi ngày một bước, bạn sẽ đi xa hơn tưởng tượng!",
    icon: TrendingUp,
  },
  {
    quote: "Kiên trì là chìa khóa của thành công!",
    icon: Star,
  },
  {
    quote: "Học hôm nay, tỏa sáng ngày mai!",
    icon: Sparkles,
  },
  {
    quote: "Bạn đang làm rất tốt! Tiếp tục nhé!",
    icon: Award,
  },
  {
    quote: "Mỗi từ vựng mới là một cánh cửa mở!",
    icon: Zap,
  },
];

export default function MotivationCard({ summary }: MotivationCardProps) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // Get a "random" quote based on date (so it changes daily)
  const dailyQuote = useMemo(() => {
    const dayIndex = today.getDate() % motivationalQuotes.length;
    return motivationalQuotes[dayIndex];
  }, [today.getDate()]);

  const QuoteIcon = dailyQuote.icon;

  // Get streak status
  const streak = summary?.streak || 0;
  const streakMessage = useMemo(() => {
    if (streak === 0) return "Bắt đầu streak mới hôm nay!";
    if (streak < 3) return `${streak} ngày streak! Tiếp tục nhé!`;
    if (streak < 7) return `${streak} ngày! Bạn đang rất cố gắng!`;
    if (streak < 30) return `${streak} ngày! Tuyệt vời lắm! 🔥`;
    return `${streak} ngày! Bạn là huyền thoại! 🏆`;
  }, [streak]);

  return (
    <Card className="h-full bg-gradient-to-br from-primary via-primary to-violet-600 text-primary-foreground p-6 rounded-3xl border-2 border-primary-foreground/20 relative overflow-hidden flex flex-col justify-between">
      <div className="relative z-10">
        {/* Quote Section */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl shrink-0">
            <QuoteIcon className="w-5 h-5" />
          </div>
          <p className="text-lg font-bold leading-snug">{dailyQuote.quote}</p>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
          <Flame
            className={`w-6 h-6 ${
              streak > 0 ? "text-orange-400 fill-orange-400" : "text-white/50"
            }`}
          />
          <div>
            <p className="text-xs text-white/70 font-medium">Streak hiện tại</p>
            <p className="font-bold text-sm">{streakMessage}</p>
          </div>
        </div>
      </div>

      {/* Week Progress Dots */}
      <div className="relative z-10 mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-1 mb-2">
          <Calendar className="w-4 h-4 text-white/70" />
          <span className="text-xs font-medium text-white/70">Tuần này</span>
        </div>
        <div className="flex justify-between">
          {daysOfWeek.map((day, index) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  index === dayOfWeek
                    ? "bg-white text-primary scale-110 shadow-lg"
                    : index < dayOfWeek
                    ? "bg-white/30 text-white"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {index < dayOfWeek ? (
                  <Star className="w-4 h-4 fill-current" />
                ) : (
                  day
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorations */}
      <Sparkles className="absolute top-4 right-4 text-white/20 w-8 h-8" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-violet-400/20 rounded-full blur-3xl"></div>
    </Card>
  );
}
