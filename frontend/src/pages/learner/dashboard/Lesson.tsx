import { useState } from "react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

import { QuestionRenderer } from "@/components/learner/questionRenderer";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Flag, Loader2, X, } from "lucide-react";
import { useLesson } from "@/hooks/useLesson";
import { useReport } from "@/hooks/useReport";
import { ReportCreate } from "@/types/report";
import { ReportDialog } from "@/components/learner/management/ReportDialog";

export default function LessonPage() {
  const navigate = useNavigate();
  const lessonId = Number(useParams().lessonId);
  const { loading, error, questions, currentQuestion, currentStep, progressPercent, submitting, completing, completed, completionData, submitAnswer, next, prev } = useLesson(lessonId);

  const { createReport } = useReport();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleReport = async (data: ReportCreate) => {
    try {
      await createReport({
        ...data,
        affected_lesson_id: lessonId ?? undefined,
      });
      toast.success("Đã gửi báo cáo");
    } catch (err: any) {
      toast.error(err?.message || "Báo cáo thất bại");
    } finally {
      setShowReportDialog(false);
    }
  };

  if (Number.isNaN(lessonId)) {
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
          <p className="text-muted-foreground font-medium">Đang tải bài học...</p>
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
          <Button onClick={() => navigate('/dashboard/learn')}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  if (completed && completionData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center border-2 border-green-200 dark:border-green-900 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 fill-green-600 stroke-white" />
          </div>

          <h1 className="text-3xl font-extrabold text-green-600 mb-2">
            Tuyệt vời!
          </h1>
          <p className="text-lg text-muted-foreground font-medium mb-8">
            Bạn đã hoàn thành bài học xuất sắc.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-8 border-2 border-green-100 dark:border-green-900">
            <p className="text-4xl font-black text-green-600 mb-2">
              {Math.round(completionData.score)}%
            </p>
            <p className="text-sm font-bold text-green-600/70 uppercase tracking-wider">
              Độ chính xác
            </p>
          </div>

          <div className="flex gap-4 mb-8 justify-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
              <span className="font-bold text-yellow-700 dark:text-yellow-500 text-sm">
                +{completionData.xp} XP
              </span>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <span className="font-bold text-blue-700 dark:text-blue-500 text-sm">
                +{completionData.streak} Streak
              </span>
            </div>
          </div>

          <Button
            onClick={next}
            className="w-full h-12 text-lg font-bold shadow-sm"
          >
            Tiếp tục
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

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-3xl mx-auto p-4 md:p-6">
      {/* Header & Progress Bar */}
      <header className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-muted text-muted-foreground"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowReportDialog(true)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Flag className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-8 text-foreground">
          Câu {currentStep + 1}/{questions.length}
        </h1>

        <Card className="p-8 md:p-12 border-2 border-border rounded-2xl shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center bg-card">
          {/* Render question based on type */}
          <QuestionRenderer
            question={currentQuestion}
            onAnswerSubmit={(answer) => submitAnswer(currentQuestion.id, answer)}
            submitting={submitting}
          />
        </Card>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t-2 border-border pt-6 pb-8">
        <div className="flex justify-between items-center max-w-3xl mx-auto gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={prev}
            disabled={currentStep === 0}
            className="font-bold text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Trước
          </Button>

          <Button
            size="lg"
            onClick={next}
            disabled={submitting || completing}
            className={currentStep === questions.length - 1
              ? "px-10 h-12 font-bold bg-green-500 hover:bg-green-600 text-white shadow-md hover:translate-y-0.5 active:translate-y-1 transition-all"
            : ""
            }
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
                <ChevronRight className="w-5 h-5 ml-2" />
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
    </div>
  );
}
