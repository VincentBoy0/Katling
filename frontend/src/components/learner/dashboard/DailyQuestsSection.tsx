import { Clock, Target } from "lucide-react";
import DailyTaskItem, { DailyTask } from "./DailyTaskItem";

interface DailyQuestsSectionProps {
  tasks: DailyTask[];
  claimedTasks: number[];
  onClaim: (taskId: number, reward: number) => void;
  timeRemaining?: string;
}

export default function DailyQuestsSection({
  tasks,
  claimedTasks,
  onClaim,
  timeRemaining = "8h",
}: DailyQuestsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Nhiệm vụ hằng ngày
        </h2>
        <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <Clock className="w-3.5 h-3.5" />
          <span>Kết thúc sau {timeRemaining}</span>
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl divide-y divide-border overflow-hidden">
        {tasks.map((task) => (
          <DailyTaskItem
            key={task.id}
            task={task}
            isClaimed={claimedTasks.includes(task.id)}
            onClaim={onClaim}
          />
        ))}
      </div>
    </div>
  );
}
