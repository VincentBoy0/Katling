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
  X,
} from "lucide-react";
import { useRecorder } from "@/hooks/useRecorder";
import { usePronunciation } from "@/hooks/usePronunciation";


export default function PronunciationPracticePage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"word" | "sentence">("word");
  const [total, setTotal] = useState<5 | 7 | 10>(5);
  const [isRecording, setIsRecording] = useState(false);
  const { start, stop } = useRecorder();

  const {
    items,
    currentItem,
    currentIndex,
    results,
    completed,
    feedbacks,
    errorsMap,
    assess,
    next,
    retry,
    loading,
  } = usePronunciation(total, mode);

  const displayText = currentItem?.text || "";

  const handleRecord = async () => {
    if (
      isRecording ||
      !currentItem ||
      results[currentIndex] !== undefined
    )
      return;

    setIsRecording(true);
    await start();
    await new Promise((r) => setTimeout(r, 3000));
    const audioBlob = await stop();
    setIsRecording(false);

    try {
      await assess(audioBlob);
    } catch (e) {
      alert("Đánh giá phát âm thất bại, thử lại nhé!");
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) next();
    else navigate("/dashboard/practice");
  };

  const handleRetry = () => {
    retry();
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

  const progressPercent = ((currentIndex + 1) / total) * 100;

  if (loading || !currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải bài luyện...
      </div>
    );
  }


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
            {currentIndex + 1}/{total}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="word">Từ đơn</option>
          <option value="sentence">Câu</option>
        </select>

        <select
          value={total}
          onChange={(e) => setTotal(Number(e.target.value) as any)}
          className="border rounded-lg px-3 py-2"
        >
          <option value={5}>5</option>
          <option value={7}>7</option>
          <option value={10}>10</option>
        </select>
      </div>


      {/* 2. MAIN CARD */}
      <Card className="w-full max-w-2xl p-8 md:p-12 border-2 border-border rounded-3xl shadow-sm flex flex-col items-center text-center bg-card relative overflow-hidden">
        {/* Pattern Background: Tím nhạt */}
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 -z-10" />

        <div className="space-y-6 mb-10 w-full relative z-10">
          <div>
            <p className="text-sm font-bold text-primary/70 uppercase tracking-widest mb-2">
              {mode === "word" ? "Đọc to từ này" : "Đọc to câu sau"}
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-primary mb-4 tracking-tight">
              {mode === "sentence" &&
                results[currentIndex] !== undefined &&
                errorsMap[currentIndex]?.length ? (
                  renderHighlightedSentence(displayText, errorsMap[currentIndex])
                ) : (
                  displayText
                )}
            </h1>
            <div className="text-sm text-muted-foreground">
              Phát âm rõ ràng và tự nhiên
            </div>
          </div>
        </div>

        {/* 3. RECORDING AREA */}
        <div className="w-full flex flex-col items-center gap-6">
          {/* Chưa có kết quả -> Hiển thị nút Mic */}
          {results[currentIndex] === undefined ? (
            <div
              className="relative group cursor-pointer"
              onClick={results[currentIndex] === undefined ? handleRecord : undefined}
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
                const visual = getScoreVisuals(results[currentIndex]);
                const Icon = visual.icon;
                return (
                  <div
                    className={`p-6 rounded-2xl border-2 mb-6 ${visual.color}`}
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Icon className="w-8 h-8" />
                      <span className="text-4xl font-black">
                        {results[currentIndex]}%
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
                  disabled={isRecording}
                  className="font-bold border-2 h-12 px-6 hover:bg-muted"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={results[currentIndex] === undefined}
                  className="font-bold h-12 px-8 shadow-md hover:translate-y-0.5 active:translate-y-1 transition-all"
                >
                  Tiếp theo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
          {results[currentIndex] !== undefined && feedbacks[currentIndex] && (
            <div className="mt-4 p-4 rounded-xl bg-muted/40 border text-left text-sm leading-relaxed whitespace-pre-line">
              <p className="font-bold mb-2 text-foreground">Nhận xét</p>
              {feedbacks[currentIndex]}
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
              {completed.length}
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


function renderHighlightedSentence(
  sentence: string,
  errors: { word: string; severity?: string }[]
) {
  const errorMap = new Map(
    errors.map((e) => [e.word.toLowerCase(), e.severity])
  );

  return sentence.split(" ").map((w, i) => {
    const clean = w.toLowerCase().replace(/[.,!?]/g, "");
    const severity = errorMap.get(clean);

    let cls = "";
    if (severity === "severe")
      cls = "text-orange-700 font-bold underline decoration-2";
    else if (severity === "moderate")
      cls = "text-orange-600 underline decoration-dashed";
    else if (severity === "minor")
      cls = "text-yellow-600 underline decoration-dotted";

    return (
      <span key={i} className={cls}>
        {w}{" "}
      </span>
    );
  });
}
