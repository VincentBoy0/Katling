import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LessonInTopicOut } from "@/types/learning";
import {
  Book,
  BookOpen,
  Check,
  Eye,
  FileText,
  Headphones,
  Lock,
  MessageSquare,
  Mic,
  Play,
  Star,
  Zap,
} from "lucide-react";

interface LessonCardProps {
  lesson: LessonInTopicOut;
  lessonNumber: number;
  onOpenLesson: (lessonId: number) => void;
  onContinueLesson: (lessonId: number) => void;
  onViewContent?: (lessonId: number) => void;
}

const getLessonTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    READING: FileText,
    LISTENING: Headphones,
    SPEAKING: Mic,
    WRITING: MessageSquare,
    VOCABULARY: Book,
    GRAMMAR: Zap,
    TEST: Star,
  };
  return icons[type] || BookOpen;
};

const getLessonTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    READING:
      "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50",
    LISTENING:
      "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900/50",
    SPEAKING:
      "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50",
    WRITING:
      "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50",
    VOCABULARY:
      "text-pink-600 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-900/50",
    GRAMMAR:
      "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50",
    TEST: "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50",
  };
  return colors[type] || "text-muted-foreground bg-muted border-border";
};

export default function LessonCard({
  lesson,
  lessonNumber,
  onOpenLesson,
  onContinueLesson,
  onViewContent,
}: LessonCardProps) {
  const isCompleted = lesson.status === "completed";
  const isAvailable = lesson.status === "available";
  const isLocked = lesson.status === "locked";

  const LessonIcon = getLessonTypeIcon(lesson.type);
  const lessonColorClass = getLessonTypeColor(lesson.type);

  return (
    <Card
      className={`transition-all duration-300 overflow-hidden group ${
        isAvailable
          ? "cursor-pointer hover:shadow-lg hover:scale-[1.01] border-2 border-primary/30 hover:border-primary"
          : isCompleted
          ? "cursor-pointer hover:shadow-lg hover:scale-[1.01] bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10 border-2 border-green-200 dark:border-green-900/50 hover:border-green-400"
          : "bg-muted/30 border-2 border-border opacity-60"
      }`}
      onClick={() => {
        if (isAvailable || isCompleted) onOpenLesson(lesson.id);
      }}
    >
      {/* Progress Bar at top */}
      {lesson.progress > 0 && (
        <div className="h-1 w-full bg-secondary/30">
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted
                ? "bg-gradient-to-r from-green-400 to-green-500"
                : "bg-gradient-to-r from-primary/80 to-primary"
            }`}
            style={{ width: `${isCompleted ? 100 : lesson.progress}%` }}
          />
        </div>
      )}

      {/* Lesson Header */}
      <div className="p-4 flex items-center gap-3">
        {/* Lesson Number Badge */}
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-base md:text-lg shrink-0 transition-transform duration-300 group-hover:scale-105 ${
            isCompleted
              ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md"
              : isAvailable
              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isCompleted ? (
            <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
          ) : isLocked ? (
            <Lock className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            lessonNumber
          )}
        </div>

        {/* Lesson Type Icon */}
        <div
          className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-105 ${lessonColorClass}`}
        >
          <LessonIcon className="w-5 h-5 md:w-6 md:h-6" />
        </div>

        {/* Lesson Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base md:text-lg mb-0.5 truncate">
            {lesson.title}
          </h3>
          {lesson.description && (
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
              {lesson.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-medium">
            <span className={`px-2 py-0.5 rounded-md ${lessonColorClass}`}>
              {lesson.type}
            </span>
            {lesson.progress > 0 && !isCompleted && (
              <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {Math.round(lesson.progress)}%
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Content Button */}
          {onViewContent && !isLocked && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onViewContent(lesson.id);
              }}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              title="Xem nội dung bài học"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}

          {/* Start/Continue Button */}
          <Button
            size="sm"
            variant={isCompleted ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              onContinueLesson(lesson.id);
            }}
            disabled={isLocked}
            className={`font-semibold transition-all duration-300 ${
              isCompleted
                ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                : "hover:scale-105"
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Ôn tập
              </>
            ) : lesson.progress > 0 ? (
              <>
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                Tiếp tục
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                Bắt đầu
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
