import { TopicProgressOut } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { Check, Lock, Play, Star } from "lucide-react";
import { useTopicLessons } from "@/hooks/useTopicLessons";


interface TopicCardProps {
  topic: TopicProgressOut;
  index: number;
  onStartLesson: (lessonId: number) => void;
}

export default function TopicCard({
  topic,
  index,
  onStartLesson,
}: TopicCardProps) {
  const isLocked = topic.status === "locked";
  const isCurrent = topic.status === "current";
  const isCompleted = topic.status === "completed";

  const { lessons, loading } = useTopicLessons(
    isLocked ? -1 : topic.id
  );

  const nextLesson =
    lessons.find((l) => l.status === "available") ??
    lessons[lessons.length - 1];

  return (
    <div className="relative">
      {/* Topic Header Card */}
      <div
        className={`relative z-10 bg-card border-2 rounded-2xl overflow-hidden transition-all ${
          isLocked
            ? "border-border opacity-70 grayscale"
            : "border-primary/20 shadow-sm"
        }`}
      >
        {/* Progress Bar */}
        {!isLocked && (
          <div className="h-1.5 w-full bg-secondary/30">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${topic.progress}%` }}
            />
          </div>
        )}

        <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex gap-4 items-center">
            {/* Badge */}
            <div
              className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-extrabold text-xl border-2 ${
                isLocked
                  ? "bg-muted text-muted-foreground border-muted-foreground/20"
                  : isCompleted
                  ? "bg-green-500 text-white border-green-600"
                  : "bg-primary text-primary-foreground border-primary-foreground/20"
              }`}
            >
              {isCompleted ? (
                <Check className="w-6 h-6" strokeWidth={3} />
              ) : (
                index + 1
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">
                {topic.name}
              </h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {topic.description}
              </p>
            </div>
          </div>

          {isLocked ? (
            <div className="p-2 bg-muted rounded-lg">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
              <Star className="w-4 h-4 fill-primary" />
              <span>{Math.round(topic.progress)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {isCurrent && (
        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            disabled={loading || !nextLesson}
            onClick={() => nextLesson && onStartLesson(nextLesson.id)}
            className="font-bold shadow-md px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            Tiếp tục học
          </Button>
        </div>
      )}

      {/* Completed Badge */}
      {isCompleted && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
            <Check className="w-4 h-4" />
            Đã hoàn thành
          </span>
        </div>
      )}
    </div>
  );
}
