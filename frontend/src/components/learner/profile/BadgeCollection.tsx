import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";

interface Badge {
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
}

interface BadgeCollectionProps {
  badges: Badge[];
}

export default function BadgeCollection({ badges }: BadgeCollectionProps) {
  return (
    <>
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2 pt-4">
        <Award className="w-6 h-6 text-yellow-500" />
        Bộ sưu tập Huy hiệu ({badges.filter((b) => b.unlocked).length}/
        {badges.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {badges.map((badge, idx) => (
          <Card
            key={idx}
            className={`p-4 flex flex-col items-center text-center gap-3 border-2 rounded-2xl transition-all ${
              badge.unlocked
                ? "border-border bg-card hover:-translate-y-1 hover:shadow-md cursor-pointer"
                : "border-border/50 bg-muted/30 opacity-60"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-sm border-2 ${
                badge.unlocked
                  ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-200"
                  : "bg-muted border-border grayscale"
              }`}
            >
              {badge.icon}
            </div>
            <div>
              <p
                className={`font-bold text-sm ${
                  badge.unlocked ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {badge.name}
              </p>
              {badge.unlocked ? (
                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Đã nhận
                </span>
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1 inline-block">
                  Khóa
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
