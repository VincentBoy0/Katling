import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, ChevronLeft, Folder, Layers, Library, RotateCw, Sparkles, X,
} from "lucide-react";

import { useFlashcardLibrary } from "@/hooks/useFlashcardLibrary";
import { useFlashcardSession } from "@/hooks/useFlashcardSession";


export default function FlashcardPracticePage() {
  const navigate = useNavigate();
  const { savedWords, folders, statusCounts, startSession, isLoading, error } = useFlashcardLibrary();
  const { cards, currentIndex, currentCard, isFlipped, progress, setIsFlipped, start, next, exit } = useFlashcardSession();

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    folders.forEach((folder) => {
      counts[folder] = savedWords.filter((w) => w.category === folder).length;
    });
    return counts;
  }, [folders, savedWords]);


  if (!cards) {
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

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Library className="w-5 h-5 text-primary" />
            Từ vựng đã lưu
          </h2>

          {/* Smart Decks   */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <DeckButton
              icon={<Layers className="w-6 h-6" />}
              title="Ôn tập tất cả"
              onClick={async () => {
                const cards = await startSession({
                  mode: "all",
                });
                if (cards.length > 0) {
                  start(cards);
                }

              }}
            />

            <DeckButton
              icon={<Sparkles className="w-6 h-6" />}
              title="Từ mới"
              subtitle={`${statusCounts.NEWBIE} thẻ`}
              onClick={async () => {
                const cards = await startSession({
                  mode: "review_status",
                  reviewStatus: "NEWBIE",
                })
                if (cards.length > 0) {
                  start(cards);
                }

              }}
            />

            <DeckButton
              icon={<BrainCircuit className="w-6 h-6" />}
              title="Đang học"
              subtitle={`${statusCounts.LEARNING} thẻ`}
              onClick={async () => {
                const cards = await startSession({
                  mode: "review_status",
                  reviewStatus: "LEARNING",
                })
                if (cards.length > 0) {
                  start(cards);
                }

              }}
            />
          </div>

          {/* Folder Decks */}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-6 mb-3">
            Theo Thư mục
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder) => {
              return (
                <div
                  key={folder}
                  onClick={async () => {
                    const cards = await startSession({
                      mode: "category",
                      category: folder,
                    });
                    if (cards.length > 0) {
                      start(cards);
                    }

                  }}
                  className="flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer hover:-translate-y-1 transition-all"
                >
                  <Folder className="w-5 h-5" />
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      {/* HEADER */}
      <div className="w-full max-w-2xl mb-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={exit}
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden border border-border">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full bg-primary`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="font-bold text-primary text-sm">
            {currentIndex + 1}/{cards.length}
          </div>
        </div>
      </div>

      {/* CARD */}
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
            className={`absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-8 border-2 border-b-8 bg-card rounded-3xl shadow-xl`}
          >
            <span className="text-5xl font-black text-foreground mb-4 text-center">
              {currentCard?.word}
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
              {currentCard?.definition}
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
          <ActionButton icon={<RotateCw />} label="Quên rồi" onClick={next} />
          <ActionButton icon={<BrainCircuit />} label="Hơi khó" onClick={next} />
          <ActionButton icon={<CheckCircle2 />} label="Nhớ rồi" onClick={next} />
        </div>
      </div>
    </div>
  );
}

function DeckButton({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-card border-2 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all flex items-center gap-4"
    >
      <div className="p-3 rounded-xl">{icon}</div>
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        {subtitle && (
          <p className="text-xs font-bold text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-yellow-200 bg-white hover:bg-yellow-50 hover:border-yellow-300 active:translate-y-1 transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
        {icon}
      </div>
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}
