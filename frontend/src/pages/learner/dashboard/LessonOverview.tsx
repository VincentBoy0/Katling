import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { learningService } from "@/services/learningService";
import lessonService from "@/services/lessonService";
import { LessonInTopicOut, LessonSectionSummary } from "@/types/learning";
import {
  AlertCircle,
  ArrowLeft,
  Book,
  BookOpen,
  CheckCircle,
  ChevronRight,
  FileText,
  Headphones,
  Loader2,
  MessageSquare,
  Mic,
  Star,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
  const { lessonId } = useParams<{ lessonId: string }>();

  const location = useLocation();
  const lesson = location.state?.lesson as LessonInTopicOut | undefined;

  const [sections, setSections] = useState<LessonSectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSections = async () => {
      if (!lessonId) return;

      try {
        setLoading(true);
        const response = await learningService.getLessonSections(
          Number(lessonId)
        );
        setSections(response.sections);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải bài học");
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, [lessonId]);

  const handleContinue = async () => {
    if (!lessonId) return;

    const res = await lessonService.getNextSection(Number(lessonId));

    if ("section" in res) {
      navigate(`/dashboard/lessons/${lessonId}/sections/${res.section.id}`);
    } else {
      navigate("/dashboard/learn");
    }
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="mb-6">
            Không tìm thấy thông tin bài học.
            <br />
            Vui lòng quay lại trang học.
          </p>
          <Button onClick={() => navigate("/dashboard/learn")}>Quay lại</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">
            Đang tải bài học...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="mb-6">{error}</p>
          <Button onClick={() => navigate("/dashboard/learn")}>Quay lại</Button>
        </Card>
      </div>
    );
  }

  const LessonIcon = getLessonTypeIcon(lesson.type);
  const gradientColor = getLessonTypeColor(lesson.type);
  const completedCount = sections.filter((s) => s.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Bài học
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Lesson Header Card */}
        <Card className="overflow-hidden border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`h-1.5 bg-gradient-to-r ${gradientColor}`} />
          <div className="p-5 md:p-8">
            <div className="flex items-start gap-4 md:gap-6">
              <div
                className={`p-3 md:p-4 rounded-2xl bg-gradient-to-br ${gradientColor} shadow-lg shrink-0 transition-transform duration-300 hover:scale-105`}
              >
                <LessonIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${gradientColor} shadow-sm`}
                  >
                    {lesson.type}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {completedCount}/{sections.length} phần hoàn thành
                  </span>
                  {lesson.status === "completed" && (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Đã hoàn thành
                    </span>
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold mb-2 text-foreground">
                  {lesson.title}
                </h2>

                {lesson.description && (
                  <p className="text-muted-foreground text-sm md:text-base mb-3 line-clamp-2">
                    {lesson.description}
                  </p>
                )}

                {/* Progress Bar */}
                {lesson.progress > 0 && lesson.status !== "completed" && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        Tiến độ
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {lesson.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradientColor} transition-all duration-700 rounded-full`}
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Sections List */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            Danh sách các phần ({completedCount}/{sections.length})
          </h3>

          {sections.map((section, index) => {
            const isLocked = index > 0 && !sections[index - 1].completed;

            return (
              <Card
                key={section.id}
                className={`overflow-hidden transition-all duration-200 ${
                  isLocked
                    ? "bg-muted/30 opacity-60"
                    : section.completed
                    ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 hover:shadow-md"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Index/Status Badge */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      section.completed
                        ? "bg-green-500 text-white"
                        : isLocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary border-2 border-primary/30"
                    }`}
                  >
                    {section.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Section Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-foreground truncate">
                      {section.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      {section.question_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {section.question_count} câu hỏi
                        </span>
                      )}
                      {section.completed && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          • Đã hoàn thành
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    disabled={isLocked}
                    variant={section.completed ? "outline" : "default"}
                    size="sm"
                    className={`flex-shrink-0 ${
                      section.completed
                        ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        : ""
                    }`}
                    onClick={() =>
                      navigate(
                        `/dashboard/lessons/${lessonId}/sections/${section.id}`,
                        {
                          state: { isReview: section.completed },
                        }
                      )
                    }
                  >
                    {isLocked
                      ? "🔒"
                      : section.completed
                      ? "Ôn lại"
                      : "Học ngay"}
                    {!isLocked && <ChevronRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        {sections.length === 0 && (
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
