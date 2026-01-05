import { ChevronRight, ChevronDown, BookOpen } from "lucide-react";
import { Lesson, LessonType, LessonStatus } from "@/types/content";
import { format } from "date-fns";

interface LessonCardProps {
  lesson: Lesson;
  isExpanded: boolean;
  onClick: () => void;
}

const typeColors: Record<LessonType, string> = {
  READING: "bg-blue-500/20 text-blue-600",
  LISTENING: "bg-pink-500/20 text-pink-600",
  SPEAKING: "bg-indigo-500/20 text-indigo-600",
  WRITING: "bg-purple-500/20 text-purple-600",
  VOCABULARY: "bg-green-500/20 text-green-600",
  GRAMMAR: "bg-orange-500/20 text-orange-600",
  TEST: "bg-red-500/20 text-red-600",
};

const statusColors: Record<LessonStatus, string> = {
  DRAFT: "bg-gray-500/20 text-gray-600",
  PENDING: "bg-yellow-500/20 text-yellow-600",
  PUBLISHED: "bg-green-500/20 text-green-600",
  ARCHIVED: "bg-slate-500/20 text-slate-600",
  REJECTED: "bg-red-500/20 text-red-600",
};

export function LessonCard({ lesson, isExpanded, onClick }: LessonCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ml-8 ${
        isExpanded
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <BookOpen className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                typeColors[lesson.type]
              }`}
            >
              {lesson.type}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                statusColors[lesson.status]
              }`}
            >
              {lesson.status}
            </span>
          </div>
          <p className="font-semibold text-foreground text-sm truncate">
            {lesson.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(lesson.created_at), "dd/MM/yyyy")}
          </p>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>
    </button>
  );
}
