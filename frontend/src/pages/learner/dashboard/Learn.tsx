import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Lock, Loader2, AlertCircle, Zap, Trophy, Target } from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import EnhancedTopicCard from "@/components/learner/EnhancedTopicCard";


export default function LearnPage() {
  const navigate = useNavigate();
  const { topics, loading, error } = useTopics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Đang tải khóa học...</p>
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
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
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
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            🚀 Lộ trình học tập
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Hoàn thành các bài học để mở khóa chủ đề tiếp theo.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {topics.filter(t => t.status === "completed").length}/{topics.length}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Chủ đề hoàn thành</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    topics.reduce((sum, t) => sum + t.progress, 0) / topics.length || 0
                  )}%
                </p>
                <p className="text-sm text-muted-foreground font-medium">Tiến độ tổng thể</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {topics.findIndex(t => t.status === "current") + 1 || 1}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Chủ đề hiện tại</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        {topics.map((topic, index) => (
          <EnhancedTopicCard
            key={topic.id}
            topic={topic}
            index={index}
            onStartLesson={(lessonId) => {
              navigate(`/dashboard/topics/${topic.id}/lessons/${lessonId}`);
            }}
            autoExpand={topic.status === "current"}
          />
        ))}

        {/* Coming Soon Section */}
        {topics.length > 0 && topics[topics.length - 1].status === 'completed' && (
          <Card className="text-center py-12 border-2 border-dashed">
            <div className="inline-block p-4 bg-muted rounded-full mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-foreground">Sắp có nội dung mới!</h3>
            <p className="text-muted-foreground font-medium">
              Bạn đã hoàn thành tất cả các chủ đề hiện có. Nội dung mới đang được cập nhật.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
