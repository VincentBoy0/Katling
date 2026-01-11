import { DailyMissionOut } from "@/types/mission";
import { CheckCircle, Lock, Star } from "lucide-react";

interface DailyMissionItemProps {
  mission: DailyMissionOut;
  onClaim: (missionId: number) => void;
  isClaiming: boolean;
}

const getMissionIcon = (description: string): string => {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes("listening") || lowerDesc.includes("nghe"))
    return "🎧";
  if (lowerDesc.includes("writing") || lowerDesc.includes("viết")) return "✍️";
  if (lowerDesc.includes("speaking") || lowerDesc.includes("nói")) return "🗣️";
  if (lowerDesc.includes("reading") || lowerDesc.includes("đọc")) return "📖";
  if (lowerDesc.includes("vocabulary") || lowerDesc.includes("từ vựng"))
    return "📚";
  if (lowerDesc.includes("grammar") || lowerDesc.includes("ngữ pháp"))
    return "📝";
  if (lowerDesc.includes("word") || lowerDesc.includes("từ")) return "⭐";
  if (lowerDesc.includes("flashcard")) return "🎴";
  if (lowerDesc.includes("score") || lowerDesc.includes("điểm")) return "🎯";
  if (lowerDesc.includes("section") || lowerDesc.includes("bài")) return "📚";

  return "🎯";
};

export default function DailyMissionItem({
  mission,
  onClaim,
  isClaiming,
}: DailyMissionItemProps) {
  const progressPercentage = (mission.progress / mission.target) * 100;
  const isCompleted = mission.status === "completed";
  const isClaimed = mission.is_claimed;
  const canClaim = mission.can_claim;

  return (
    <div
      className={`bg-card rounded-lg p-4 border-2 transition-all ${
        isCompleted
          ? "border-green-400 dark:border-green-500 shadow-md"
          : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">
          {getMissionIcon(mission.description)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm mb-1">
            {mission.description}
          </h4>

          <div className="flex items-center gap-2 mb-2">
            <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
              {mission.xp} XP
            </span>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {mission.progress}/{mission.target}
              </span>
              <span
                className={`font-semibold ${
                  isCompleted
                    ? "text-green-600 dark:text-green-400"
                    : "text-primary"
                }`}
              >
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`h-full rounded-full transition-all ${
                  isCompleted ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {isClaimed ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span>Đã nhận</span>
            </div>
          ) : canClaim ? (
            <button
              onClick={() => onClaim(mission.id)}
              disabled={isClaiming}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming ? "Đang nhận..." : "Nhận thưởng"}
            </button>
          ) : isCompleted ? (
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Hoàn thành</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              <span>Chưa hoàn thành</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
