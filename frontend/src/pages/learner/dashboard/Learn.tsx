import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Lock, Loader2, AlertCircle } from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import TopicCard from "@/components/learner/TopicCard";


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
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Lộ trình học tập
        </h1>
        <p className="text-muted-foreground font-medium">
          Hoàn thành các bài học để mở khóa chủ đề tiếp theo.
        </p>
      </div>

      <div className="space-y-8">
        {topics.map((topic, index) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            index={index}
            onStartLesson={(lessonId) => navigate(`/dashboard/lesson/${lessonId}`)}
          />
        ))}

        {/* Coming Soon Section - Chỉ hiển thị nếu topic cuối đã completed */}
        {topics.length > 0 && topics[topics.length - 1].status === 'completed' && (
          <div className="text-center py-10 opacity-50">
            <div className="inline-block p-4 bg-muted rounded-full mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <p className="font-bold text-muted-foreground">
              Nội dung mới đang được cập nhật!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
