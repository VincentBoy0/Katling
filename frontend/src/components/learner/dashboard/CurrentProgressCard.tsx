import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopicProgressOut } from "@/types/learning";
import {
  BookOpen,
  ChevronRight,
  Loader2,
  Play,
  Sparkles,
  Trophy,
} from "lucide-react";

interface CurrentProgressCardProps {
  currentTopic: TopicProgressOut | null;
  loading: boolean;
  onContinue: () => void;
}

export default function CurrentProgressCard({
  currentTopic,
  loading,
  onContinue,
}: CurrentProgressCardProps) {
  if (loading) {
    return (
      <Card className="relative overflow-hidden border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/10 p-6 md:p-8 rounded-3xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </Card>
    );
  }

  // If no current topic, show completion or welcome message
  if (!currentTopic) {
    return (
      <Card className="relative overflow-hidden border-2 border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 md:p-8 rounded-3xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-200/50 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              Tuyệt vời!
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-emerald-900 dark:text-emerald-100">
              Bạn đã hoàn thành tất cả! 🎉
            </h2>
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">
              Hãy ôn tập lại các bài học để củng cố kiến thức nhé.
            </p>
          </div>

          <Button
            onClick={onContinue}
            className="h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md hover:translate-y-[-2px] active:translate-y-0 transition-all shrink-0 w-full md:w-auto"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Ôn tập
          </Button>
        </div>

        {/* Decor */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <Sparkles className="absolute bottom-4 right-4 w-12 h-12 text-emerald-300/50" />
      </Card>
    );
  }

  const progressPercent = Math.round(currentTopic.progress);

  return (
    <Card className="relative overflow-hidden border-2 border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 p-6 md:p-8 rounded-3xl">
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-200/50 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              Đang học
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-indigo-900 dark:text-indigo-100">
              {currentTopic.name}
            </h2>
            {currentTopic.description && (
              <p className="text-indigo-700 dark:text-indigo-300 font-medium line-clamp-2">
                {currentTopic.description}
              </p>
            )}
          </div>

          <Button
            onClick={onContinue}
            className="h-14 text-lg font-bold hover:bg-primary/90 shadow-md hover:translate-y-[-2px] active:translate-y-0 transition-all shrink-0 w-full md:w-auto"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Học tiếp
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-xl p-4">
          <div className="flex justify-between text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2">
            <span>Tiến độ chủ đề</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-3 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Decor */}
      <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl -mr-10 -mt-10"></div>
      <div className="absolute left-0 bottom-0 w-32 h-32 bg-violet-200/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
    </Card>
  );
}
