import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTopicLessons } from "@/hooks/useTopicLessons";
import { cn } from "@/lib/utils";
import lessonService from "@/services/lessonService";
import { LessonInTopicOut, TopicProgressOut } from "@/types/learning";
import { LessonContentResponse } from "@/types/lesson";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  Star,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LessonCard from "./LessonCard";
import LessonContentModal from "./LessonContentModal";

interface EnhancedTopicCardProps {
  topic: TopicProgressOut;
  index: number;
  autoExpand?: boolean;
}

export default function EnhancedTopicCard({
  topic,
  index,
  autoExpand = false,
}: EnhancedTopicCardProps) {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [contentModal, setContentModal] = useState<{
    lessonId: number | null;
    content: LessonContentResponse | null;
    loading: boolean;
  }>({ lessonId: null, content: null, loading: false });
  const navigate = useNavigate();

  const isLocked = topic.status === "locked";
  const isCurrent = topic.status === "current";
  const isCompleted = topic.status === "completed";

  const { lessons = [], loading } = useTopicLessons(
    topic.status === "locked" ? -1 : topic.id
  );

  const completedLessons = lessons.filter(
    (l) => l.status === "completed"
  ).length;

  const handleToggle = () => {
    if (!isLocked) setIsExpanded((prev) => !prev);
  };

  const handleViewContent = async (lessonId: number) => {
    setContentModal({ lessonId, content: null, loading: true });
    try {
      const content = await lessonService.getLessonContent(lessonId);
      setContentModal({ lessonId, content, loading: false });
    } catch (error) {
      console.error("Failed to load lesson content:", error);
      setContentModal({ lessonId: null, content: null, loading: false });
    }
  };

  const handleCloseContentModal = () => {
    setContentModal({ lessonId: null, content: null, loading: false });
  };

  const handleOpenLesson = (lesson: LessonInTopicOut) => {
    navigate(`/dashboard/lessons/${lesson.id}`, {
      state: { lesson },
    });
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isCompleted
          ? "border-2 border-green-200 dark:border-green-900/50 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10"
          : isCurrent
          ? "border-2 border-primary shadow-lg ring-2 ring-primary/20"
          : "border-2 border-border hover:border-muted-foreground/30"
      }`}
    >
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-secondary/30">
        <div
          className={`h-full transition-all duration-700 ease-out ${
            isCompleted
              ? "bg-gradient-to-r from-green-400 to-green-500"
              : "bg-gradient-to-r from-primary/80 to-primary"
          }`}
          style={{ width: `${topic.progress}%` }}
        />
      </div>

      {/* Topic Header - Clickable */}
      <div
        onClick={isLocked ? undefined : handleToggle}
        className={cn(
          "p-5 md:p-6 transition-colors",
          isLocked
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-muted/30"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Topic Badge */}
          <div
            className={`w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-2xl flex items-center justify-center font-extrabold text-xl md:text-2xl shadow-md transition-transform duration-300 group-hover:scale-105 ${
              isCompleted
                ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                : isCurrent
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-4 ring-primary/20"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {isCompleted ? (
              <Trophy className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
            ) : (
              index + 1
            )}
          </div>

          {/* Topic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 truncate">
                  {topic.name}
                </h2>
                {topic.description && (
                  <p className="text-sm text-muted-foreground font-medium line-clamp-1 mb-2">
                    {topic.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {completedLessons}/{lessons.length} bài học
                  </span>
                  {!isCompleted && topic.progress > 0 && (
                    <span className="text-primary flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary" />
                      {Math.round(topic.progress)}%
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs">
                      <Check className="w-3.5 h-3.5" />
                      Hoàn thành
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full text-xs animate-pulse">
                      <Play className="w-3.5 h-3.5 fill-primary" />
                      Đang học
                    </span>
                  )}
                </div>
              </div>

              {/* Expand Button */}
              {!isLocked && (
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
              )}
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
                  onOpenLesson={() => handleOpenLesson(lesson)}
                  onContinueLesson={async (lessonId) => {
                    const res = await lessonService.getNextSection(lessonId);

                    if ("section" in res) {
                      navigate(
                        `/dashboard/lessons/${lessonId}/sections/${res.section.id}`
                      );
                    } else {
                      navigate("/dashboard/learn");
                    }
                  }}
                  onViewContent={handleViewContent}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lesson Content Modal */}
      {(contentModal.loading || contentModal.content) && (
        <LessonContentModal
          content={contentModal.content}
          loading={contentModal.loading}
          onClose={handleCloseContentModal}
          onStartLesson={async () => {
            if (!contentModal.lessonId) return;
            handleCloseContentModal();
            const res = await lessonService.getNextSection(contentModal.lessonId);
            if ("section" in res) {
              navigate(
                `/dashboard/lessons/${contentModal.lessonId}/sections/${res.section.id}`
              );
            } else {
              navigate("/dashboard/learn");
            }
          }}
          onViewSections={() => {
            if (!contentModal.lessonId) return;
            handleCloseContentModal();
            const lesson = lessons.find((l) => l.id === contentModal.lessonId);
            if (lesson) {
              handleOpenLesson(lesson);
            }
          }}
        />
      )}

      {/* Quick Action for Current Topic (when collapsed) */}
      {isCurrent && !isExpanded && lessons.length > 0 && (
        <div className="p-4 border-t border-border bg-primary/5">
          <Button
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              const nextLesson = lessons.find((l) => l.status === "available");

              if (nextLesson) {
                handleOpenLesson(nextLesson);
              }
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
