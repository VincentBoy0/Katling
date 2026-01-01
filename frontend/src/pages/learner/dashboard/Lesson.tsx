import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { learningService } from "@/services/learningService";
import { useAuth } from "@/context/auth-context";
import { Question, QuestionContent, AnswerSubmitResponse } from "@/types/learning";
import { QuestionRenderer } from "@/components/learner/questionRenderer";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/learner/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/learner/select";
import { Textarea } from "@/components/learner/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Flag, Loader2, Volume2, X, } from "lucide-react";


export default function LessonPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { updateUser, user } = useAuth();

  // States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);

  // User answers tracking
  const [userAnswers, setUserAnswers] = useState<Map<number, QuestionContent>>(new Map());
  const [answerResults, setAnswerResults] = useState<Map<number, AnswerSubmitResponse>>(new Map());

  // Dialog States
  const [showBugReportDialog, setShowBugReportDialog] = useState(false);
  const [showPronunciationWindow, setShowPronunciationWindow] = useState(false);
  const [bugReport, setBugReport] = useState("");
  const [bugType, setBugType] = useState("");

  const lessonId = Number(params.id);

  // Fetch next section and questions when component mounts
  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get next section for this lesson
        const nextSectionData = await learningService.getNextSection(lessonId);

        if (nextSectionData.status === 'completed') {
          // Lesson đã hoàn thành
          alert(nextSectionData.message);
          navigate('/dashboard/learn');
          return;
        }

        if (!nextSectionData.section) {
          throw new Error('Không tìm thấy section');
        }

        const section = nextSectionData.section;
        setSectionId(section.id);

        // 2. Get questions for this section
        const questionsData = await learningService.getSectionQuestions(section.id);
        setQuestions(questionsData.questions);

      } catch (err: any) {
        console.error('Error loading lesson:', err);
        setError(err.response?.data?.detail || 'Không thể tải bài học');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      loadLessonData();
    }
  }, [lessonId, navigate]);

  const currentQuestion = questions[currentStep];
  const progressPercent = questions.length > 0
    ? ((currentStep + 1) / questions.length) * 100
    : 0;

  const handleAnswerSubmit = async (answer: QuestionContent) => {
    if (!currentQuestion) return;

    try {
      setSubmitting(true);
      const result = await learningService.submitAnswer(currentQuestion.id, answer);

      // Save answer and result
      setUserAnswers((prev) => new Map(prev).set(currentQuestion.id, answer));
      setAnswerResults((prev) => new Map(prev).set(currentQuestion.id, result));

      if (result.is_correct) {
        console.log('Answer correct!');
      } else {
        console.log('Answer incorrect. Correct answer', result.correct_answer);
      }
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      alert(err.response?.data?.detail || 'Lỗi khi gửi câu trả lời');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleted = () => {
    // Calculate score based on correct answers
    const correctCount = Array.from(answerResults.values()).filter(result => result.is_correct).length;
    const calculatedScore = questions.length > 0
      ? (correctCount / questions.length) * 100
      : 0;

    // Update user exp and energy
    const newExp = (user?.exp || 0) + 50;
    const newEnergy = Math.max(0, (user?.energy || 0) - 1);
    updateUser({ exp: newExp, energy: newEnergy });

    setScore(calculatedScore);
    setCompleted(true);
  };

  const handleContinue = () => {
    navigate("/dashboard/learn");
  }

  const handleNext = async () => {
    if (!answerResults.has(currentQuestion.id)) {
      alert("Vui lòng trả lời câu hỏi trước khi tiếp tục.");
      return;
    }

    if (currentStep === questions.length - 1) {
      handleCompleted();
    } else {
      setCurrentStep((i) => i + 1);
    }
  };

  const handleBugReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise((resolve) => setTimeout(resolve, 500));
    alert("Báo cáo lỗi đã được gửi. Cảm ơn bạn!");
    setBugReport("");
    setBugType("");
    setShowBugReportDialog(false);
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

if (completed) {
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
              {Math.round(score)}%
            </p>
            <p className="text-sm font-bold text-green-600/70 uppercase tracking-wider">
              Độ chính xác
            </p>
          </div>

          <div className="flex gap-4 mb-8 justify-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
              <span className="font-bold text-yellow-700 dark:text-yellow-500 text-sm">
                +50 XP
              </span>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <span className="font-bold text-blue-700 dark:text-blue-500 text-sm">
                +1 Streak
              </span>
            </div>
          </div>

          <Button
            onClick={handleContinue}
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

  // --- MÀN HÌNH HỌC TẬP ---
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
          onClick={() => setShowBugReportDialog(true)}
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
            onAnswerSubmit={handleAnswerSubmit}
            currentAnswer={userAnswers.get(currentQuestion.id)}
            answerResult={answerResults.get(currentQuestion.id)}
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
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="font-bold text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Trước
          </Button>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={submitting || !answerResults.has(currentQuestion.id)}
            className={currentStep === questions.length - 1
              ? "px-10 h-12 font-bold bg-green-500 hover:bg-green-600 text-white shadow-md hover:translate-y-0.5 active:translate-y-1 transition-all"
            : ""
            }
          >
            {currentStep === questions.length - 1 ? (
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

      {/* Bug Report Dialog */}
      <Dialog open={showBugReportDialog} onOpenChange={setShowBugReportDialog}>
        <DialogContent className="sm:max-w-md border-2 border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <AlertCircle className="w-6 h-6 text-destructive" />
              Báo cáo vấn đề
            </DialogTitle>
            <DialogDescription>
              Giúp chúng tôi cải thiện chất lượng bài học.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBugReport} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">
                Loại lỗi
              </label>
              <Select value={bugType} onValueChange={setBugType}>
                <SelectTrigger className="border-2 font-medium">
                  <SelectValue placeholder="Chọn vấn đề gặp phải" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Nội dung sai</SelectItem>
                  <SelectItem value="audio">
                    Âm thanh không nghe được
                  </SelectItem>
                  <SelectItem value="ui">Lỗi hiển thị</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">
                Chi tiết
              </label>
              <Textarea
                placeholder="Mô tả thêm..."
                value={bugReport}
                onChange={(e) => setBugReport(e.target.value)}
                required
                className="border-2 font-medium min-h-[100px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 font-bold"
                onClick={() => setShowBugReportDialog(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 font-bold shadow-sm"
                disabled={!bugType || !bugReport}
              >
                Gửi đi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
