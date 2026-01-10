import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  Lock,
  Play,
  FileText,
  Headphones,
  Mic,
  MessageSquare,
  Book,
  Zap,
  Star,
} from "lucide-react";
import { learningService } from "@/services/learningService";
import { TopicInTopicOut } from "@/types/learning";

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
    READING: "from-blue-500 to-blue-600",
    LISTENING: "from-purple-500 to-purple-600",
    SPEAKING: "from-orange-500 to-orange-600",
    WRITING: "from-green-500 to-green-600",
    VOCABULARY: "from-pink-500 to-pink-600",
    GRAMMAR: "from-yellow-500 to-yellow-600",
    TEST: "from-red-500 to-red-600",
  };
  return colors[type] || "from-gray-500 to-gray-600";
};

export default function LessonOverview() {
  const navigate = useNavigate();
  const { lessonId, topicId } = useParams();
  const [lesson, setLesson] = useState<TopicInTopicOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId || !topicId) return;

      try {
        setLoading(true);
        const response = await learningService.getTopicLessons(Number(topicId));
        const foundLesson = response.lessons.find(l => l.id === Number(lessonId));
        
        if (!foundLesson) {
          setError("Bài học không tồn tại");
        } else if (foundLesson.status === "locked") {
          setError("Bài học này đang bị khóa. Hãy hoàn thành bài học trước đó!");
        } else {
          setLesson(foundLesson);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải bài học");
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, topicId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 text-center max-w-md border-2 border-destructive/20">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Có lỗi xảy ra</h2>
          <p className="text-muted-foreground mb-6">{error || "Bài học không tồn tại"}</p>
          <Button onClick={() => navigate("/dashboard/learn")}>
            Quay lại trang học
          </Button>
        </Card>
      </div>
    );
  }

  const LessonIcon = getLessonTypeIcon(lesson.type);
  const gradientColor = getLessonTypeColor(lesson.type);
  const completedSections = lesson.sections?.filter(s => s.completed).length || 0;
  const totalSections = lesson.sections?.length || 0;
  const hasSections = totalSections > 0;

  const handleStartSection = (sectionId: number) => {
    navigate(`/dashboard/lessons/${lessonId}/sections/${sectionId}`);
  };

  const handleContinueLearning = () => {
    // Find first uncompleted section or first section
    const nextSection = lesson.sections?.find(s => !s.completed) || lesson.sections?.[0];
    if (nextSection) {
      handleStartSection(nextSection.id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/learn")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Bài học</p>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Lesson Header Card */}
        <Card className={`overflow-hidden border-2`}>
          <div className={`h-2 bg-gradient-to-r ${gradientColor}`} />
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientColor} shadow-lg shrink-0`}>
                <LessonIcon className="w-10 h-10 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${gradientColor}`}>
                    {lesson.type}
                  </span>
                  {lesson.status === "completed" && (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Đã hoàn thành
                    </span>
                  )}
                </div>

                <h2 className="text-3xl font-extrabold mb-3 text-foreground">
                  {lesson.title}
                </h2>

                {lesson.description && (
                  <p className="text-muted-foreground text-lg mb-4">
                    {lesson.description}
                  </p>
                )}

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">
                      {totalSections} phần
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-foreground">
                      {completedSections}/{totalSections} hoàn thành
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {lesson.progress > 0 && lesson.status !== "completed" && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Tiến độ</span>
                      <span className="text-sm font-bold text-primary">{lesson.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradientColor} transition-all duration-500`}
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Continue Button */}
            {hasSections && (
              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  size="lg"
                  onClick={handleContinueLearning}
                  className="w-full md:w-auto px-8 h-12 text-lg font-bold shadow-md"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {lesson.progress > 0 ? "Tiếp tục học" : "Bắt đầu học"}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Sections List */}
        {hasSections ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Danh sách các phần
            </h3>

            <div className="space-y-3">
              {lesson.sections!.map((section, index) => {
                const isCompleted = section.completed;
                const isLocked = index > 0 && !lesson.sections![index - 1].completed;

                return (
                  <Card
                    key={section.id}
                    className={`p-5 border-2 transition-all ${
                      isCompleted
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50"
                        : isLocked
                        ? "bg-muted/50 border-muted opacity-60"
                        : "border-border hover:border-primary hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Section Number/Status */}
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isLocked
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-7 h-7" strokeWidth={2.5} />
                        ) : isLocked ? (
                          <Lock className="w-6 h-6" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Section Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-foreground mb-1 truncate">
                          {section.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {section.question_count !== undefined && (
                            <span className="font-medium">
                              📝 {section.question_count} câu hỏi
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Hoàn thành
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-muted-foreground font-semibold flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5" />
                              Khóa
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleStartSection(section.id)}
                        disabled={isLocked}
                        variant={isCompleted ? "outline" : "default"}
                        size="lg"
                        className="shrink-0 font-semibold"
                      >
                        {isCompleted ? (
                          <>
                            Ôn lại
                            <ChevronRight className="w-4 h-4 ml-1.5" />
                          </>
                        ) : (
                          <>
                            {index === 0 || lesson.sections![index - 1].completed ? "Bắt đầu" : "Khóa"}
                            <ChevronRight className="w-4 h-4 ml-1.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Chưa có nội dung</h3>
            <p className="text-muted-foreground">
              Bài học này chưa có phần học nào. Vui lòng quay lại sau!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
