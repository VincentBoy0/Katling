import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import learningService from "@/services/learningService";
import { TopicProgressOut } from "@/types/learning";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Check, Lock, Play, Star, Loader2, AlertCircle } from "lucide-react";


export default function LearnPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicProgressOut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await learningService.getTopics();
        setTopics(data.topics);
      } catch (err: any) {
        console.error("Error fetching topics:", err);
        setError(err.response?.data?.message || "Đã có lỗi xảy ra khi tải chủ đề.");
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

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

// Component cho mỗi Topic
interface TopicCardProps {
  topic: TopicProgressOut;
  index: number;
  onStartLesson: (lessonId: number) => void;
}

function TopicCard({ topic, index, onStartLesson }: TopicCardProps) {
  const isLocked = topic.status === 'locked';
  const isCurrent = topic.status === 'current';
  const isCompleted = topic.status === 'completed';

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
        {/* Progress Bar Top */}
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
            {/* Badge Number */}
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

      {/* Action Button for Current Topic */}
      {isCurrent && (
        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={() => onStartLesson(topic.id)}
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
