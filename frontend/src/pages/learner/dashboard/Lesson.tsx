import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { QuestionRenderer } from "@/components/learner/questionRenderer";

import { ReportDialog } from "@/components/learner/management/ReportDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLesson } from "@/hooks/useLesson";
import { useReport } from "@/hooks/useReport";
import { ReportCreate } from "@/types/report";
import {
  AlertCircle,
  BatteryWarning,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  X,
  Zap,
} from "lucide-react";

export default function LessonPage() {
  const navigate = useNavigate();
  const { lessonId, sectionId } = useParams();
  const location = useLocation();
  const isReview = location.state?.isReview === true;
  const {
    loading,
    error,
    questions,
    currentQuestion,
    currentStep,
    progressPercent,
    submitting,
    completing,
    completed,
    completionData,
    submitAnswer,
    next,
    prev,
    answerResults,
    energy,
  } = useLesson(
    Number(lessonId),
    sectionId ? Number(sectionId) : undefined,
    isReview
  );

  const { createReport } = useReport();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const isOutOfEnergy = energy !== null && energy <= 0;

  const handleReport = async (data: ReportCreate) => {
    try {
      await createReport({
        ...data,
        affected_lesson_id: lessonId ? Number(lessonId) : undefined,
      });
      toast.success("Đã gửi báo cáo");
    } catch (err: any) {
      toast.error(err?.message || "Báo cáo thất bại");
    } finally {
      setShowReportDialog(false);
    }
  };

  if (!lessonId || Number.isNaN(Number(lessonId))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Lesson không hợp lệ</p>
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
        <Card className="p-8 text-center max-w-md border-2 border-destructive/20">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Có lỗi xảy ra</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/dashboard/learn")}>Quay lại</Button>
        </Card>
      </div>
    );
  }

  if (completed && completionData) {
    const score = Math.round(completionData.score);

    // Lời nhận xét dựa trên điểm số
    const getFeedback = () => {
      if (score >= 90)
        return {
          title: "Tuyệt vời!",
          message: "Bạn đã hoàn thành xuất sắc!",
          color: "green",
        };
      if (score >= 70)
        return {
          title: "Khá tốt!",
          message: "Bạn đã làm rất tốt, tiếp tục phát huy nhé!",
          color: "green",
        };
      if (score >= 50)
        return {
          title: "Cố gắng hơn!",
          message: "Kết quả tạm ổn, hãy ôn tập thêm nhé!",
          color: "yellow",
        };
      return {
        title: "Đừng nản lòng!",
        message: "Hãy ôn tập lại để cải thiện kết quả nhé!",
        color: "orange",
      };
    };

    const feedback = getFeedback();
    const colorClasses = {
      green: {
        border: "border-green-200 dark:border-green-900",
        bg: "bg-green-100",
        text: "text-green-600",
        scoreBg: "bg-green-50 dark:bg-green-900/20",
        scoreBorder: "border-green-100 dark:border-green-900",
      },
      yellow: {
        border: "border-yellow-200 dark:border-yellow-900",
        bg: "bg-yellow-100",
        text: "text-yellow-600",
        scoreBg: "bg-yellow-50 dark:bg-yellow-900/20",
        scoreBorder: "border-yellow-100 dark:border-yellow-900",
      },
      orange: {
        border: "border-orange-200 dark:border-orange-900",
        bg: "bg-orange-100",
        text: "text-orange-600",
        scoreBg: "bg-orange-50 dark:bg-orange-900/20",
        scoreBorder: "border-orange-100 dark:border-orange-900",
      },
    };

    const colors = colorClasses[feedback.color as keyof typeof colorClasses];

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
        <Card
          className={`w-full max-w-md p-8 text-center border-2 ${colors.border} shadow-xl animate-in zoom-in-95 duration-500`}
        >
          <div
            className={`w-24 h-24 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500 shadow-lg`}
          >
            <CheckCircle
              className={`w-12 h-12 ${colors.text} fill-current stroke-white animate-in spin-in-180 duration-700`}
            />
          </div>

          <h1
            className={`text-3xl font-extrabold ${colors.text} mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500`}
          >
            {feedback.title}
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            {feedback.message}
          </p>

          <div
            className={`${colors.scoreBg} rounded-xl p-6 mb-8 border-2 ${colors.scoreBorder}`}
          >
            <p className={`text-4xl font-black ${colors.text} mb-2`}>
              {score}%
            </p>
            <p
              className={`text-sm font-bold ${colors.text}/70 uppercase tracking-wider`}
            >
              Độ chính xác
            </p>
          </div>

          <div className="flex gap-4 mb-8 justify-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
              <span className="font-bold text-yellow-700 dark:text-yellow-500 text-sm">
                +{completionData.xp} XP
              </span>
            </div>
            {completionData.streak !== undefined &&
              completionData.streak !== null && (
                <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <span className="font-bold text-blue-700 dark:text-blue-500 text-sm">
                    +{completionData.streak} Streak
                  </span>
                </div>
              )}
          </div>

          <Button
            onClick={() => navigate("/dashboard/learn")}
            className="w-full h-12 text-lg font-bold shadow-sm"
          >
            Quay về bài học
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Không có câu hỏi nào</p>
      </div>
    );
  }

  // Màn hình hết năng lượng
  if (isOutOfEnergy) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center border-2 border-orange-200 dark:border-orange-900 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BatteryWarning className="w-12 h-12 text-orange-600" />
          </div>

          <h1 className="text-3xl font-extrabold text-orange-600 mb-2">
            Hết năng lượng!
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-8">
            Bạn đã hết năng lượng. Hãy nghỉ ngơi và quay lại sau nhé!
          </p>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 mb-8 border-2 border-orange-100 dark:border-orange-900">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-8 h-8 text-orange-500" />
              <p className="text-4xl font-black text-orange-600">0</p>
            </div>
            <p className="text-sm font-bold text-orange-600/70 uppercase tracking-wider mt-2">
              Năng lượng còn lại
            </p>
          </div>

          <Button
            onClick={() => navigate("/dashboard/learn")}
            className="w-full h-12 text-lg font-bold shadow-sm"
          >
            Thoát
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-3xl mx-auto p-4 md:p-6">
      {/* Header & Progress Bar */}
      <header className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowExitDialog(true)}
          className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </Button>

        <div className="flex-1 h-3 md:h-4 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700 ease-out rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            {progressPercent > 10 && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
            )}
          </div>
        </div>

        {/* Hiển thị Energy */}
        {energy !== null && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full border border-yellow-200 dark:border-yellow-800 shadow-sm">
            <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-500 fill-yellow-400" />
            <span className="font-bold text-yellow-700 dark:text-yellow-500 text-sm">
              {energy}
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowReportDialog(true)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Flag className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-4 md:mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold">
            Câu {currentStep + 1}
            <span className="text-primary/60">/ {questions.length}</span>
          </span>
        </div>

        <Card
          key={currentQuestion.id}
          className="p-6 md:p-10 border-2 border-border rounded-2xl shadow-sm min-h-[280px] md:min-h-[320px] flex flex-col justify-center items-center text-center bg-card animate-in fade-in zoom-in-95 duration-300"
        >
          {/* Render question based on type */}
          <QuestionRenderer
            question={currentQuestion}
            onAnswerSubmit={(answer) =>
              submitAnswer(currentQuestion.id, answer)
            }
            submitting={submitting}
            answerResult={answerResults.get(currentQuestion.id)}
          />
        </Card>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t-2 border-border pt-4 md:pt-6 pb-6 md:pb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex justify-between items-center max-w-3xl mx-auto gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={prev}
            disabled={currentStep === 0}
            className="font-bold text-muted-foreground hover:bg-muted transition-all"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-6 bg-primary"
                    : idx < currentStep
                    ? "bg-green-500"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Button
            size="lg"
            onClick={next}
            disabled={submitting || completing}
            className={`font-bold transition-all duration-300 ${
              currentStep === questions.length - 1
                ? "px-6 md:px-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                : "hover:scale-105"
            }`}
          >
            {completing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : currentStep === questions.length - 1 ? (
              <>
                HOÀN THÀNH
                <CheckCircle className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Tiếp
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </footer>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onSubmit={handleReport}
      />

      {/* Exit Confirm Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Thoát bài học?</h2>
              <p className="text-muted-foreground">
                Tiến độ học của bạn trong phần này sẽ không được lưu. Bạn có
                chắc muốn thoát?
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowExitDialog(false)}
              >
                Học tiếp
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => navigate("/dashboard/learn")}
              >
                Thoát
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
