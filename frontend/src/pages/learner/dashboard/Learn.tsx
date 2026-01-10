import EnhancedTopicCard from "@/components/learner/EnhancedTopicCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTopics } from "@/hooks/useTopics";
import {
  AlertCircle,
  BookOpen,
  Loader2,
  Lock,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

export default function LearnPage() {
  const { topics, loading, error } = useTopics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">
            Đang tải khóa học...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 text-center max-w-md border-2 border-destructive/20">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Có lỗi xảy ra</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </Card>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 text-center max-w-md">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Chưa có bài học</h2>
          <p className="text-muted-foreground">
            Hiện tại chưa có khóa học nào. Vui lòng quay lại sau!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <span className="p-2 bg-primary/10 rounded-xl">
              <Target className="w-8 h-8 text-primary" />
            </span>
            Lộ trình học tập
          </h1>
          <p className="text-muted-foreground font-medium text-base md:text-lg pl-1">
            Hoàn thành các bài học để mở khóa chủ đề tiếp theo.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <Card className="p-4 border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-md group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {topics.filter((t) => t.status === "completed").length}
                  <span className="text-muted-foreground text-lg font-medium">
                    /{topics.length}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Chủ đề hoàn thành
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 hover:border-green-300 dark:hover:border-green-800 transition-all duration-300 hover:shadow-md group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 text-green-600 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    topics.reduce((sum, t) => sum + t.progress, 0) /
                      topics.length || 0
                  )}
                  <span className="text-green-600 text-lg font-medium">%</span>
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Tiến độ tổng thể
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 hover:border-orange-300 dark:hover:border-orange-800 transition-all duration-300 hover:shadow-md group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-orange-600 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  Chủ đề{" "}
                  <span className="text-orange-600">
                    {topics.findIndex((t) => t.status === "current") + 1 || 1}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Đang học
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        {topics.map((topic, index) => (
          <div
            key={topic.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <EnhancedTopicCard
              topic={topic}
              index={index}
              autoExpand={topic.status === "current"}
            />
          </div>
        ))}

        {/* Coming Soon Section */}
        {topics.length > 0 &&
          topics[topics.length - 1].status === "completed" && (
            <Card className="text-center py-12 border-2 border-dashed border-primary/30 bg-gradient-to-b from-primary/5 to-transparent animate-in fade-in duration-700">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4 animate-pulse">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-foreground">
                Sắp có nội dung mới!
              </h3>
              <p className="text-muted-foreground font-medium max-w-md mx-auto">
                🎉 Bạn đã hoàn thành tất cả các chủ đề hiện có. Nội dung mới
                đang được cập nhật.
              </p>
            </Card>
          )}
      </div>
    </div>
  );
}
