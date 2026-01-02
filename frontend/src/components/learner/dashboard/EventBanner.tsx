import { Card } from "@/components/ui/card";
import { Calendar, Star } from "lucide-react";

interface EventBannerProps {
  eventName: string;
  title: string;
  description: string;
  progress: number;
  total: number;
}

export default function EventBanner({
  eventName,
  title,
  description,
  progress,
  total,
}: EventBannerProps) {
  const progressPercent = (progress / total) * 100;

  return (
    <Card className="h-full bg-primary text-primary-foreground p-6 rounded-3xl border-2 border-primary-foreground/20 relative overflow-hidden flex flex-col justify-between">
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-primary-foreground/80 font-bold text-xs uppercase tracking-wider mb-2">
          <Calendar className="w-4 h-4" />
          {eventName}
        </div>
        <h3 className="text-xl font-black leading-tight mb-2">{title}</h3>
        <p className="text-sm text-primary-foreground/90 font-medium mb-4">
          {description}
        </p>
      </div>

      <div className="relative z-10 bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
        <div className="flex justify-between text-xs font-bold mb-1.5">
          <span>Tiến độ</span>
          <span>
            {progress}/{total}
          </span>
        </div>
        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stars Decor */}
      <Star className="absolute top-4 right-4 text-accent w-8 h-8 animate-pulse fill-accent" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </Card>
  );
}
