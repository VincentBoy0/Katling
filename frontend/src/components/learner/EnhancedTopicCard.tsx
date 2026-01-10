import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  Star,
  Play,
  Trophy,
  Loader2
} from "lucide-react";
import { useTopicLessons } from "@/hooks/useTopicLessons";
import LessonCard from "./LessonCard";

interface EnhancedTopicCardProps {
  topic: {
    id: number;
    name: string;
    description: string;
    status: "completed" | "current" | "locked";
    progress: number;
  };
  index: number;
  onStartLesson: (lessonId: number, sectionId?: number) => void;
  autoExpand?: boolean;
}

export default function EnhancedTopicCard({
  topic,
  index,
  onStartLesson,
  autoExpand = false,
}: EnhancedTopicCardProps) {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const isCurrent = topic.status === "current";
  const isCompleted = topic.status === "completed";

  const { lessons, loading } = useTopicLessons(topic.id);

  const completedLessons = lessons.filter(l => l.progress === 100);

  const totalLessons = lessons.length;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLessonClick = (lessonId: number) => {
    onStartLesson(lessonId);
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        isCompleted
          ? "border-2 border-green-200 dark:border-green-900/50 shadow-md"
          : isCurrent
          ? "border-2 border-primary shadow-lg"
          : "border-2 border-border"
      }`}
    >
      {/* Progress Bar */}
      <div className="h-2 w-full bg-secondary/30">
        <div
          className={`h-full transition-all duration-500 ${
            isCompleted ? "bg-green-500" : "bg-primary"
          }`}
          style={{ width: `${topic.progress}%` }}
        />
      </div>

      {/* Topic Header - Clickable */}
      <div
        onClick={handleToggle}
        className="p-5 md:p-6 cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Topic Badge */}
          <div
            className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-extrabold text-2xl border-2 shadow-md ${
              isCompleted
                ? "bg-green-500 text-white border-green-600"
                : isCurrent
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-foreground border-border"
            }`}
          >
            {isCompleted ? (
              <Trophy className="w-8 h-8" strokeWidth={2.5} />
            ) : (
              index + 1
            )}
          </div>

          {/* Topic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 truncate">
                  {topic.name}
                </h2>
                <p className="text-sm text-muted-foreground font-medium line-clamp-2 mb-2">
                  {topic.description}
                </p>

                {totalLessons > 0 && (
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="text-muted-foreground">
                      📚 {completedLessons}/{totalLessons} bài học
                    </span>
                    {!isCompleted && (
                      <span className="text-primary flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary" />
                        {Math.round(topic.progress)}%
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Hoàn thành
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Expand Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle();
                }}
                className="shrink-0"
              >
                {isExpanded ? (
                  <ChevronUp className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Lessons Section */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/10">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">
                Đang tải bài học...
              </p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Play className="w-8 h-8" />
              </div>
              <p className="font-semibold text-lg">Chưa có bài học nào</p>
              <p className="text-sm mt-1">Nội dung đang được cập nhật</p>
            </div>
          ) : (
            <div className="p-4 md:p-6 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Danh sách bài học
                </h3>
                <span className="text-sm text-muted-foreground font-medium">
                  {lessons.length} bài
                </span>
              </div>

              {lessons.map((lesson, lessonIndex) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  lessonNumber={lessonIndex + 1}
                  onStartLesson={handleLessonClick}
                  showSections={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Action for Current Topic (when collapsed) */}
      {isCurrent && !isExpanded && lessons.length > 0 && (
        <div className="p-4 border-t border-border bg-primary/5">
          <Button
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              const nextLesson = lessons.find((l) => l.status === "available") || lessons[0];
              handleLessonClick(nextLesson.id);
            }}
            className="w-full font-bold shadow-sm"
          >
            <Play className="w-5 h-5 mr-2" />
            Tiếp tục học
          </Button>
        </div>
      )}
    </Card>
  );
}
