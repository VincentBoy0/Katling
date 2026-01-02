import { Button } from "@/components/ui/button";
import {
  Check,
  CheckCircle,
  ChevronRight,
  Gift,
  LucideIcon,
} from "lucide-react";

export interface DailyTask {
  id: number;
  name: string;
  icon: LucideIcon;
  reward: number;
  progress: number;
  total: number;
}

interface DailyTaskItemProps {
  task: DailyTask;
  isClaimed: boolean;
  onClaim: (taskId: number, reward: number) => void;
}

export default function DailyTaskItem({
  task,
  isClaimed,
  onClaim,
}: DailyTaskItemProps) {
  const progressPercent = (task.progress / task.total) * 100;
  const isFinished = task.progress >= task.total;
  const Icon = task.icon;

  return (
    <div className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group">
      {/* Icon */}
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 border-transparent
          group-hover:scale-105 transition-transform
          ${
            isFinished
              ? "bg-green-100 text-green-600"
              : "bg-primary/10 text-primary"
          }
        `}
      >
        {isFinished ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex justify-between items-center">
          <h3
            className={`font-bold text-sm md:text-base truncate ${
              isClaimed ? "text-muted-foreground line-through" : ""
            }`}
          >
            {task.name}
          </h3>

          {/* Reward Badge */}
          {!isClaimed && (
            <div className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-100 dark:bg-teal-900/50 dark:text-teal-400 px-2 py-0.5 rounded-md">
              <Gift className="w-3 h-3" />+{task.reward} XP
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`
              absolute top-0 left-0 h-full rounded-full transition-all duration-500
              ${isFinished ? "bg-green-500" : "bg-primary"}
            `}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
          <span>
            {task.progress}/{task.total}
          </span>
          {isFinished && !isClaimed && (
            <span className="text-green-600">Hoàn thành</span>
          )}
          {isClaimed && <span className="text-muted-foreground">Đã nhận</span>}
        </div>
      </div>

      {/* Action Button */}
      <div className="pl-2 shrink-0">
        {isFinished && !isClaimed ? (
          <Button
            size="sm"
            onClick={() => onClaim(task.id, task.reward)}
            className="h-9 px-4 bg-green-500 hover:bg-green-600 text-white font-bold shadow-sm animate-bounce-subtle border-green-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            Nhận
          </Button>
        ) : isClaimed ? (
          <div className="w-9 h-9 flex items-center justify-center">
            <Check className="w-6 h-6 text-muted-foreground/50" />
          </div>
        ) : (
          <div className="w-9 h-9 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
          </div>
        )}
      </div>
    </div>
  );
}
