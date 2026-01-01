import type React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/context/auth-context";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/learner/select";
import { Textarea } from "@/components/learner/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Mic,
  Volume2,
  X,
} from "lucide-react";

// Mock Data
const lessonContent = [
  {
    id: 1,
    title: "Giới thiệu cơ bản",
    type: "vocab",
    items: [
      { word: "Hello", meaning: "Xin chào", example: "Hello, how are you?" },
      {
        word: "Goodbye",
        meaning: "Tạm biệt",
        example: "Goodbye, see you later!",
      },
      {
        word: "Thank you",
        meaning: "Cảm ơn",
        example: "Thank you for your help.",
      },
    ],
  },
  {
    id: 2,
    title: "Thực hành phát âm",
    type: "pronunciation",
    items: [
      { word: "Apple", pronunciation: "/ˈæpəl/", meaning: "Quả táo" },
      { word: "Book", pronunciation: "/bʊk/", meaning: "Cuốn sách" },
      { word: "Cat", pronunciation: "/kæt/", meaning: "Con mèo" },
    ],
  },
];

export default function LessonPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { updateUser, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Dialog States
  const [showBugReportDialog, setShowBugReportDialog] = useState(false);
  const [showPronunciationWindow, setShowPronunciationWindow] = useState(false);
  const [bugReport, setBugReport] = useState("");
  const [bugType, setBugType] = useState("");

  const lessonId = Number.parseInt(params.id as string);
  const lesson =
    lessonContent.find((l) => l.id === lessonId) || lessonContent[0];
  const progressPercent = ((currentStep + 1) / lesson.items.length) * 100;

  const handleComplete = () => {
    const newExp = (user?.exp || 0) + 50;
    const newEnergy = Math.max(0, (user?.energy || 0) - 1);
    updateUser({ exp: newExp, energy: newEnergy });
    setScore(80 + Math.random() * 20);
    setCompleted(true);
  };

  const handleContinue = () => {
    navigate("/dashboard/learn");
  };

  const handleBugReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise((resolve) => setTimeout(resolve, 500));
    alert("Báo cáo lỗi đã được gửi. Cảm ơn bạn!");
    setBugReport("");
    setBugType("");
    setShowBugReportDialog(false);
  };

  const handleRecordPronunciation = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert("Phát âm của bạn: 85% chính xác. Rất tốt!");
    setShowPronunciationWindow(false);
  };

  // --- MÀN HÌNH HOÀN THÀNH ---
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

        {/* Thanh tiến độ lớn, bo tròn */}
        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Nút báo lỗi nhỏ gọn */}
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
          {lesson.title}
        </h1>

        <Card className="p-8 md:p-12 border-2 border-border rounded-2xl shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center bg-card">
          {lesson.type === "vocab" && (
            <div className="space-y-8 w-full">
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Từ vựng mới
                </p>
                <h2 className="text-5xl md:text-6xl font-black text-primary drop-shadow-sm">
                  {lesson.items[currentStep].word}
                </h2>
                <p className="text-2xl font-medium text-foreground/80 mt-4">
                  {lesson.items[currentStep].meaning}
                </p>
              </div>

              <div className="bg-secondary/20 p-6 rounded-xl border-2 border-secondary/30 inline-block max-w-lg mx-auto">
                <p className="text-lg italic font-medium text-secondary-foreground">
                  "{lesson.items[currentStep].example}"
                </p>
              </div>
            </div>
          )}

          {lesson.type === "pronunciation" && (
            <div className="space-y-8 w-full">
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Luyện phát âm
                </p>
                <h2 className="text-5xl md:text-6xl font-black text-primary">
                  {lesson.items[currentStep].word}
                </h2>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="px-3 py-1 bg-muted rounded-lg font-mono text-lg font-medium text-muted-foreground border border-border">
                    {lesson.items[currentStep].pronunciation}
                  </span>
                </div>
                <p className="text-2xl font-medium text-foreground/80 mt-2">
                  {lesson.items[currentStep].meaning}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto pt-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-14 text-lg font-bold border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Nghe
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg font-bold shadow-sm"
                  onClick={() => setShowPronunciationWindow(true)}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Thu âm
                </Button>
              </div>
            </div>
          )}
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

          {currentStep === lesson.items.length - 1 ? (
            <Button
              size="lg"
              onClick={handleComplete}
              className="px-10 h-12 font-bold bg-green-500 hover:bg-green-600 text-white shadow-md hover:translate-y-0.5 active:translate-y-1 transition-all"
            >
              HOÀN THÀNH
              <CheckCircle className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => setCurrentStep(currentStep + 1)}
              variant="default"
            >
              Tiếp
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </footer>

      {/* --- DIALOGS --- */}

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

      {/* Pronunciation Dialog */}
      <Dialog
        open={showPronunciationWindow}
        onOpenChange={setShowPronunciationWindow}
      >
        <DialogContent className="sm:max-w-md border-2 border-border text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Luyện phát âm
            </DialogTitle>
            <DialogDescription className="text-center">
              Đọc to từ vựng sau đây
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-primary">
                {lesson.items[currentStep].word}
              </h3>
              <p className="font-mono text-muted-foreground text-lg">
                {lesson.items[currentStep].pronunciation}
              </p>
            </div>

            <div
              className="relative inline-flex group cursor-pointer"
              onClick={handleRecordPronunciation}
            >
              <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></div>
              <div className="relative w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 hover:bg-red-600">
                <Mic className="w-10 h-10 text-white" />
              </div>
            </div>

            <p className="text-sm font-bold text-muted-foreground animate-pulse">
              Đang nghe...
            </p>
          </div>

          <Button
            variant="ghost"
            className="w-full font-bold"
            onClick={() => setShowPronunciationWindow(false)}
          >
            Đóng
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
