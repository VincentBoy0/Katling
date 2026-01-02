import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, ChevronLeft, Folder, Layers, Library, Play, RotateCw, Sparkles, X,
} from "lucide-react";

import { flashcardService } from "@/services/flashcardService";
import { vocabService } from "@/services/vocabService";


type FlashcardItem ={
  user_word_id: number;
  word: string;
  definition: string;
  phonetic?: string | null;
  audio_url?: string | null;
}

type SavedWord = {
  id: number;
  vocab_id: number;
  word: string;
  phonetic?: string | null;
  audio_url?: string | null;
  definition: Record<string, string[]>;
  category?: string | null;
  review_status: "NEW" | "LEARNING" | "MASTERED";
  created_at: string;
};

export default function FlashcardPracticePage() {
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<FlashcardItem[] | null>(null);
  const [setName, setSetName] = useState("");
  const [deckColor, setDeckColor] = useState("indigo");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    vocabService.getUserWords().then((res) => {
      setSavedWords(res.data);
    });
  }, []);

  const folders = useMemo(() => {
    const set = new Set<string>();

    savedWords.forEach((w) => {
      if (w.category) set.add(w.category);
    });

    return Array.from(set);
  }, [savedWords]);

  const startSession = async (
    mode: "all" | "review_status" | "category",
    options?: {
      reviewStatus?: "NEW" | "LEARNING" | "MASTERED";
      category?: string;
      name?: string;
      color?: string;
    }
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await flashcardService.getFlashcards(
        mode,
        options?.reviewStatus,
        options?.category
      );

      if (res.cards.length === 0) {
        alert("Không có thẻ nào trong mục này!");
        return;
      }

      setSelectedSet(
        res.cards.map((c) => ({
          user_word_id: c.user_word_id,
          word: c.word,
          definition: c.definition,
          phonetic: c.phonetic,
          audio_url: c.audio_url,
        }))
      );

      setSetName(options?.name ?? "Flashcards");
      setDeckColor(options?.color ?? "indigo");
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (e) {
      setError("Không tải được flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    folders.forEach((folder) => {
      counts[folder] = savedWords.filter((w) => w.category === folder).length;
    });
    return counts;
  }, [folders, savedWords]);

  const statusCounts = useMemo(() => ({
    NEW: savedWords.filter((w) => w.review_status === "NEW").length,
    LEARNING: savedWords.filter((w) => w.review_status === "LEARNING").length,
    MASTERED: savedWords.filter((w) => w.review_status === "MASTERED").length,
  }), [savedWords]);

  if (!selectedSet) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 min-h-screen">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            Thư viện Flashcard
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Chọn bộ thẻ bạn muốn ôn tập hôm nay.
          </p>
        </div>

        {/* SECTION 1: KHO TỪ VỰNG CỦA BẠN (Cập nhật Folder) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Library className="w-5 h-5 text-primary" />
            Từ vựng đã lưu
          </h2>

          {/* 1.1 Smart Decks (Lọc theo trạng thái) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div
              onClick={() =>
                startSession("all", {
                  name: "Tất cả từ vựng",
                  color: "indigo",
                })
              }
              className="bg-card border-2 border-indigo-200 dark:border-indigo-900 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all hover:border-indigo-400 group flex items-center gap-4"
            >
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Ôn tập tất cả</h3>
                <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  Bắt đầu học
                </p>
              </div>
            </div>

            <div
              onClick={() =>
                startSession("review_status", {
                  reviewStatus: "NEW",
                  name: "Từ mới",
                  color: "blue",
                })
              }
              className="bg-card border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all hover:border-blue-400 group flex items-center gap-4"
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Từ mới</h3>
                <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  {statusCounts.NEW} thẻ
                </p>
              </div>
            </div>

            <div
              onClick={() =>
                startSession("review_status", {
                  reviewStatus: "LEARNING",
                  name: "Đang học",
                  color: "yellow",
                })
              }
              className="bg-card border-2 border-yellow-200 dark:border-yellow-900 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all hover:border-yellow-400 group flex items-center gap-4"
            >
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Đang học</h3>
                <p className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  {statusCounts.LEARNING} thẻ
                </p>
              </div>
            </div>
          </div>

          {/* 1.2 Folder Decks (Lọc theo Folder) */}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-6 mb-3">
            Theo Thư mục
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder) => {
              return (
                <div
                  key={folder}
                  onClick={() =>
                    startSession("category", {
                      category: folder,
                      name: folder,
                      color: "slate",
                    })
                  }
                  className="flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer hover:-translate-y-1 transition-all bg-white dark:bg-slate-900"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground truncate">{folder}</h4>
                    <p className="text-xs text-muted-foreground font-bold">
                      {folderCounts[folder]} thẻ
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  const currentCard = selectedSet[currentIndex];
  const progressPercent = ((currentIndex + 1) / selectedSet.length) * 100;

  const getThemeColor = () => {
    switch (deckColor) {
      case "blue":
        return "text-blue-500 border-blue-200 dark:border-blue-900";
      case "yellow":
        return "text-yellow-600 border-yellow-200 dark:border-yellow-900";
      default:
        return "text-indigo-500 border-indigo-200 dark:border-indigo-900";
    }
  };

  const handleNext = () => {
    if (currentIndex < selectedSet.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    await flashcardService.completeFlashcards(
      selectedSet.map((c) => c.user_word_id)
    );
    alert("Hoàn thành buổi ôn tập 🎉");
    setSelectedSet(null);
  };


  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      {/* SESSION HEADER */}
      <div className="w-full max-w-2xl mb-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedSet(null)}
            className="text-muted-foreground hover:bg-muted"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden border border-border">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full bg-primary`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="font-bold text-primary text-sm">
            {currentIndex + 1}/{selectedSet.length}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Đang học
          </h2>
          <h1 className="text-xl font-black text-foreground">{setName}</h1>
        </div>
      </div>

      {/* FLIP CARD AREA */}
      <div className="w-full max-w-lg perspective-1000 mb-8">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`
            relative w-full aspect-[4/3] cursor-pointer transition-all duration-500 transform-style-3d
            ${isFlipped ? "rotate-y-180" : ""}
          `}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT SIDE */}
          <Card
            className={`absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 border-2 border-b-8 bg-card rounded-3xl shadow-xl ${getThemeColor()}`}
          >
            <span className="text-5xl font-black text-foreground mb-4 text-center">
              {currentCard.word}
            </span>
            <p className="text-sm font-bold text-muted-foreground animate-pulse mt-8">
              Chạm để lật thẻ
            </p>
          </Card>

          {/* BACK SIDE */}
          <Card
            className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 border-2 border-b-8 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl shadow-xl"
            style={{ transform: "rotateY(180deg)" }}
          >
            <h2 className="text-4xl font-bold text-emerald-700 dark:text-emerald-400 mb-4 text-center">
              {currentCard.definition}
            </h2>
          </Card>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div
        className={`w-full max-w-lg transition-opacity duration-300 ${
          isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:translate-y-1 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <RotateCw className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-600 text-sm">Quên rồi</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-yellow-200 bg-white hover:bg-yellow-50 hover:border-yellow-300 active:translate-y-1 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="font-bold text-yellow-600 text-sm">Hơi khó</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-green-200 bg-white hover:bg-green-50 hover:border-green-300 active:translate-y-1 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-green-600 text-sm">Đã thuộc</span>
          </button>
        </div>
      </div>
    </div>
  );
}
