import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Mic,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";

// Mock Data
const pronunciationWords = [
  { id: 1, word: "Apple", pronunciation: "/ˈæpəl/", meaning: "Quả táo" },
  { id: 2, word: "Book", pronunciation: "/bʊk/", meaning: "Cuốn sách" },
  { id: 3, word: "Beautiful", pronunciation: "/ˈbjuːtɪfl/", meaning: "Đẹp" },
  {
    id: 4,
    word: "Computer",
    pronunciation: "/kəmˈpjuːtər/",
    meaning: "Máy tính",
  },
  {
    id: 5,
    word: "Education",
    pronunciation: "/ˌedʒuˈkeɪʃən/",
    meaning: "Giáo dục",
  },
];

export default function PronunciationPracticePage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const [results, setResults] = useState<{ [key: number]: number }>({});
  const [completedWords, setCompletedWords] = useState<number[]>([]);

  const currentWord = pronunciationWords[currentIndex];
  const progressPercent =
    ((currentIndex + 1) / pronunciationWords.length) * 100;

  // --- HANDLERS ---
  const handlePlayAudio = () => {
    console.log(`Playing: ${currentWord.word}`);
  };

  const handleRecord = async () => {
    setIsRecording(true);
    // Giả lập delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRecording(false);

    // Giả lập điểm số
    const score = Math.floor(Math.random() * 50) + 50;
    setResults({ ...results, [currentWord.id]: score });

    if (!completedWords.includes(currentWord.id)) {
      setCompletedWords([...completedWords, currentWord.id]);
    }
  };

  const handleNext = () => {
    if (currentIndex < pronunciationWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/dashboard/practice");
    }
  };

  const handleRetry = () => {
    const newResults = { ...results };
    delete newResults[currentWord.id];
    setResults(newResults);
  };

  // Helper: Màu sắc Feedback (Không dùng đỏ)
  const getScoreVisuals = (score: number) => {
    if (score >= 80)
      return {
        color:
          "text-green-600 bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400",
        icon: Sparkles,
        msg: "Tuyệt vời!",
      };
    if (score >= 60)
      return {
        color:
          "text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400",
        icon: CheckCircle2,
        msg: "Làm tốt lắm!",
      };
    // Điểm thấp: Dùng màu Xám/Trung tính thay vì Đỏ (Friendly UI)
    return {
      color:
        "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
      icon: RotateCcw,
      msg: "Cần luyện thêm chút",
    };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      {/* 1. HEADER & PROGRESS */}
      <div className="w-full max-w-2xl mb-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:bg-muted"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Progress Bar: Màu Primary */}
          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="font-bold text-primary text-sm">
            {currentIndex + 1}/{pronunciationWords.length}
          </div>
        </div>
      </div>

      {/* 2. MAIN CARD */}
      <Card className="w-full max-w-2xl p-8 md:p-12 border-2 border-border rounded-3xl shadow-sm flex flex-col items-center text-center bg-card relative overflow-hidden">
        {/* Pattern Background: Tím nhạt */}
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 -z-10" />

        <div className="space-y-6 mb-10 w-full relative z-10">
          <div>
            <p className="text-sm font-bold text-primary/70 uppercase tracking-widest mb-2">
              Đọc to từ này
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-primary mb-4 tracking-tight">
              {currentWord.word}
            </h1>

            {/* Pronunciation Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-background border-2 border-border rounded-xl shadow-sm">
              <span className="font-mono text-xl text-muted-foreground">
                {currentWord.pronunciation}
              </span>
              <button
                onClick={handlePlayAudio}
                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xl font-medium text-muted-foreground">
            {currentWord.meaning}
          </p>
        </div>

        {/* 3. RECORDING AREA */}
        <div className="w-full flex flex-col items-center gap-6">
          {/* Chưa có kết quả -> Hiển thị nút Mic */}
          {!results[currentWord.id] ? (
            <div
              className="relative group cursor-pointer"
              onClick={handleRecord}
            >
              {/* Hiệu ứng sóng âm khi ghi âm (Dùng màu Primary/Accent) */}
              {isRecording && (
                <>
                  <div className="absolute inset-0 bg-accent rounded-full opacity-30 animate-ping" />
                  <div className="absolute inset-[-12px] bg-primary rounded-full opacity-10 animate-pulse" />
                </>
              )}

              <button
                disabled={isRecording}
                className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center
                  border-4 shadow-lg transition-all duration-300
                  ${
                    isRecording
                      ? "bg-primary border-primary text-white scale-110" // Khi ghi âm: Màu Tím đậm
                      : "bg-background border-primary/20 text-primary hover:border-primary hover:scale-105 active:scale-95"
                  }
                `}
              >
                <Mic
                  className={`w-10 h-10 ${isRecording ? "animate-pulse" : ""}`}
                />
              </button>

              <p className="mt-6 text-sm font-bold text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
                {isRecording ? "Đang lắng nghe..." : "Nhấn để bắt đầu"}
              </p>
            </div>
          ) : (
            // Đã có kết quả -> Hiển thị Score Board
            <div className="w-full animate-in zoom-in-95 duration-300">
              {(() => {
                const visual = getScoreVisuals(results[currentWord.id]);
                const Icon = visual.icon;
                return (
                  <div
                    className={`p-6 rounded-2xl border-2 mb-6 ${visual.color}`}
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Icon className="w-8 h-8" />
                      <span className="text-4xl font-black">
                        {results[currentWord.id]}%
                      </span>
                    </div>
                    <p className="font-bold text-lg">{visual.msg}</p>
                  </div>
                );
              })()}

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="font-bold border-2 h-12 px-6 hover:bg-muted"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>

                <Button
                  onClick={handleNext}
                  className="font-bold h-12 px-8 shadow-md hover:translate-y-0.5 active:translate-y-1 transition-all"
                >
                  Tiếp theo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 4. FOOTER STATS */}
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="bg-card border-2 border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {completedWords.length}
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase">
              Đã hoàn thành
            </p>
          </div>
        </div>

        <div className="bg-card border-2 border-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent-foreground">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {Object.keys(results).length > 0
                ? Math.round(
                    Object.values(results).reduce((a, b) => a + b, 0) /
                      Object.keys(results).length
                  )
                : 0}
              %
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase">
              TB Chính xác
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
