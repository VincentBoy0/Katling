import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePronunciation } from "@/hooks/usePronunciation";
import { useRecorder } from "@/hooks/useRecorder";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Globe,
  Heart,
  MessageCircle,
  Mic,
  Pause,
  Plane,
  Play,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Type,
  Volume2,
  X,
} from "lucide-react";

// Các topic có sẵn
const TOPICS = [
  { value: "daily", label: "Hàng ngày", icon: Coffee, color: "bg-orange-500" },
  { value: "travel", label: "Du lịch", icon: Plane, color: "bg-blue-500" },
  {
    value: "business",
    label: "Công việc",
    icon: Briefcase,
    color: "bg-slate-600",
  },
  {
    value: "shopping",
    label: "Mua sắm",
    icon: ShoppingCart,
    color: "bg-pink-500",
  },
  { value: "health", label: "Sức khỏe", icon: Heart, color: "bg-red-500" },
  { value: "general", label: "Tổng hợp", icon: Globe, color: "bg-purple-500" },
];

const COUNT_OPTIONS = [5, 7, 10] as const;

type PracticeConfig = {
  mode: "word" | "sentence";
  total: 5 | 7 | 10;
  topic: string;
};

export default function PronunciationPracticePage() {
  const navigate = useNavigate();

  // State for configuration dialog
  const [showConfigDialog, setShowConfigDialog] = useState(true);
  const [config, setConfig] = useState<PracticeConfig>({
    mode: "word",
    total: 5,
    topic: "daily",
  });

  // Practice states
  const [isRecording, setIsRecording] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [recordedAudios, setRecordedAudios] = useState<Record<number, string>>(
    {}
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
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
    reset,
  } = usePronunciation(config.total, config.mode, config.topic);

  const displayText = currentItem?.text || "";

  const handleStartPractice = () => {
    setShowConfigDialog(false);
  };

  const handleBackToConfig = () => {
    setShowConfigDialog(true);
    reset?.();
  };

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(recordedAudios).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [recordedAudios]);

  const handleRecord = async () => {
    if (
      isRecording ||
      isAssessing ||
      !currentItem ||
      results[currentIndex] !== undefined
    )
      return;

    setIsRecording(true);
    try {
      await start();
      await new Promise((r) => setTimeout(r, 3000));
      const audioBlob = await stop();
      setIsRecording(false);

      // Store the recorded audio for playback
      const audioUrl = URL.createObjectURL(audioBlob);
      setRecordedAudios((prev) => ({ ...prev, [currentIndex]: audioUrl }));

      // Show assessing state
      setIsAssessing(true);
      await assess(audioBlob);
    } catch (e) {
      console.error("Recording/Assessment error:", e);
      alert("Đánh giá phát âm thất bại, thử lại nhé!");
    } finally {
      setIsRecording(false);
      setIsAssessing(false);
    }
  };

  const handlePlayRecordedAudio = () => {
    const audioUrl = recordedAudios[currentIndex];
    if (!audioUrl) return;

    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    audio.play();
    setIsPlayingAudio(true);
  };

  const handleNext = () => {
    if (currentIndex < config.total - 1) next();
    else navigate("/dashboard/practice");
  };

  const handleRetry = () => {
    // Revoke old audio URL for this index
    if (recordedAudios[currentIndex]) {
      URL.revokeObjectURL(recordedAudios[currentIndex]);
      setRecordedAudios((prev) => {
        const newAudios = { ...prev };
        delete newAudios[currentIndex];
        return newAudios;
      });
    }
    setIsPlayingAudio(false);
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

  const progressPercent = ((currentIndex + 1) / config.total) * 100;

  // Configuration Dialog
  if (showConfigDialog) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
        <Card className="w-full max-w-lg max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white relative flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/practice")}
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Mic className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Luyện phát âm</h2>
                <p className="text-white/80 text-sm mt-1">
                  Chọn chủ đề và số lượng bạn muốn luyện
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Loại luyện tập
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfig((c) => ({ ...c, mode: "word" }))}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    config.mode === "word"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Type className="w-6 h-6" />
                  <span className="font-bold">Từ đơn</span>
                  <span className="text-xs opacity-70">Luyện từng từ</span>
                </button>
                <button
                  onClick={() => setConfig((c) => ({ ...c, mode: "sentence" }))}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    config.mode === "sentence"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-bold">Câu</span>
                  <span className="text-xs opacity-70">Luyện cả câu</span>
                </button>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                Chủ đề
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TOPICS.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.value}
                      onClick={() =>
                        setConfig((c) => ({ ...c, topic: topic.value }))
                      }
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                        config.topic === topic.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${topic.color} flex items-center justify-center`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          config.topic === topic.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {topic.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Count Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Số lượng
              </label>
              <div className="flex gap-3">
                {COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setConfig((c) => ({ ...c, total: count }))}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                      config.total === count
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {count} {config.mode === "word" ? "từ" : "câu"}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartPractice}
              className="w-full h-12 text-lg font-bold mt-4"
            >
              <Mic className="w-5 h-5 mr-2" />
              Bắt đầu luyện tập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">
            Đang tải bài luyện...
          </p>
        </div>
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
            onClick={handleBackToConfig}
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
            {currentIndex + 1}/{config.total}
          </div>
        </div>

        {/* Topic badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm font-medium text-muted-foreground">
            {(() => {
              const topic = TOPICS.find((t) => t.value === config.topic);
              const Icon = topic?.icon || Globe;
              return (
                <>
                  <Icon className="w-4 h-4" />
                  {topic?.label || "Tổng hợp"} •{" "}
                  {config.mode === "word" ? "Từ đơn" : "Câu"}
                </>
              );
            })()}
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
              {config.mode === "word" ? "Đọc to từ này" : "Đọc to câu sau"}
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-primary mb-4 tracking-tight">
              {config.mode === "sentence" &&
              results[currentIndex] !== undefined &&
              errorsMap[currentIndex]?.length
                ? renderHighlightedSentence(
                    displayText,
                    errorsMap[currentIndex]
                  )
                : displayText}
            </h1>
            <div className="text-sm text-muted-foreground">
              Phát âm rõ ràng và tự nhiên
            </div>
          </div>
        </div>

        {/* 3. RECORDING AREA */}
        <div className="w-full flex flex-col items-center gap-6">
          {/* Đang chấm điểm -> Hiển thị Loading */}
          {isAssessing ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-bold text-primary mb-1">Đang chấm điểm...</p>
                <p className="text-sm text-muted-foreground">
                  AI đang phân tích phát âm của bạn
                </p>
              </div>
            </div>
          ) : results[currentIndex] === undefined ? (
            /* Chưa có kết quả -> Hiển thị nút Mic */
            <div
              className="relative group cursor-pointer"
              onClick={
                results[currentIndex] === undefined && !isRecording
                  ? handleRecord
                  : undefined
              }
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
                {recordedAudios[currentIndex] && (
                  <Button
                    variant="outline"
                    onClick={handlePlayRecordedAudio}
                    className="font-bold border-2 h-12 px-4 hover:bg-muted"
                    title="Nghe lại phát âm của bạn"
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                )}

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
