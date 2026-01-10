import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Check,
  Play,
  ChevronDown,
  ChevronUp,
  FileText,
  Headphones,
  Mic,
  MessageSquare,
  Book,
  Zap,
  Star,
  ListOrdered,
  Lock
} from "lucide-react";
import { LessonStatus } from "@/types/content";

interface LessonSection {
  id: number;
  title: string;
  order_index: number;
  question_count?: number;
  completed?: boolean;
}

interface LessonCardProps {
  lesson: {
    id: number;
    type: string;
    title: string;
    description?: string;
    progress: number;
    status: LessonStatus;
    order_index: number;
    sections?: LessonSection[];
  };
  lessonNumber: number;
  onStartLesson: (lessonId: number) => void;
  showSections?: boolean;
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
    READING: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50",
    LISTENING: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900/50",
    SPEAKING: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50",
    WRITING: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50",
    VOCABULARY: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-900/50",
    GRAMMAR: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50",
    TEST: "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50",
  };
  return colors[type] || "text-muted-foreground bg-muted border-border";
};

export default function LessonCard({
  lesson,
  lessonNumber,
  onStartLesson,
  showSections = false,
}: LessonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPublished = lesson.status === "PUBLISHED" || lesson.status === "published";

  const isCompleted = lesson.progress === 100;
  const isInProgress = lesson.progress > 0 && lesson.progress < 100;
  const isNotStarted = lesson.progress === 0;


  const LessonIcon = getLessonTypeIcon(lesson.type);
  const lessonColorClass = getLessonTypeColor(lesson.type);

  const hasSections = lesson.sections && lesson.sections.length > 0;
  const completedSections = lesson.sections?.filter(s => s.completed).length || 0;
  const totalSections = lesson.sections?.length || 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSections && isPublished && showSections) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card
      className={`transition-all border-2 ${
        isPublished
          ? "shadow-md hover:shadow-lg bg-card border-primary/30"
          : isCompleted
          ? "bg-card/50 border-green-200 dark:border-green-900/50"
          : "bg-card/30 border-border opacity-70"
      }`}
    >
      {/* Lesson Header */}
      <div
        className={`p-4 ${isPublished ? "cursor-pointer hover:bg-muted/30" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isPublished) return;
          onStartLesson(lesson.id);
        }}
      >
        <div className="flex items-center gap-4">
          {/* Lesson Number Badge */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 shrink-0 ${
              isCompleted
                ? "bg-green-500 text-white border-green-600"
                : isPublished
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-muted"
            }`}
          >
            {isCompleted ? (
              <Check className="w-6 h-6" strokeWidth={3} />
            ) : !isPublished ? (
              <Lock className="w-5 h-5" />
            ) : (
              lessonNumber
            )}
          </div>

          {/* Lesson Type Icon */}
          <div className={`p-3 rounded-xl ${lessonColorClass}`}>
            <LessonIcon className="w-6 h-6" />
          </div>

          {/* Lesson Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg mb-1 truncate">
              {lesson.title}
            </h3>
            {lesson.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {lesson.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs font-medium">
              <span className={`px-2 py-1 rounded-md ${lessonColorClass}`}>
                {lesson.type}
              </span>
              {lesson.progress > 0 && !isCompleted && (
                <span className="text-primary">• {Math.round(lesson.progress)}%</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant={isCompleted ? "outline" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                onStartLesson(lesson.id);
              }}
              disabled={!isPublished}
              className="font-semibold"
            >
              {isCompleted ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Ôn tập
                </>
              ) : isInProgress && lesson.progress > 0 ? (
                <>
                  <Play className="w-4 h-4 mr-1.5" />
                  Tiếp tục
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1.5" />
                  Bắt đầu
                </>
              )}
            </Button>

            {hasSections && isPublished && showSections && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className="shrink-0"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {lesson.progress > 0 && !isCompleted && (
          <div className="mt-3 h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${lesson.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Sections List */}
      {isExpanded && hasSections && showSections && (
        <div className="border-t border-border bg-muted/20 p-4">
          <div className="space-y-2">
            {lesson.sections!.map((section, idx) => (
              <Card
                key={section.id}
                className={`p-3 border transition-all hover:shadow-sm ${
                  section.completed
                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        section.completed
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {section.completed ? (
                        <Check className="w-4 h-4" strokeWidth={3} />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {section.title}
                      </h4>
                      {section.question_count !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {section.question_count} câu hỏi
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={section.completed ? "outline" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartLesson(lesson.id);
                    }}
                    className="shrink-0"
                  >
                    {section.completed ? "Xem lại" : "Học"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
