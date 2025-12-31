import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Card } from "@/components/learner/card";
import { Button } from "@/components/learner/button";
import {
  ChevronLeft,
  RotateCw,
  Layers,
  BrainCircuit,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Folder,
  Library,
  Play,
} from "lucide-react";

// --- MOCK DATA (Đồng bộ cấu trúc với trang Vocabulary) ---

interface VocabItem {
  id: number;
  front: string;
  back: string;
  example?: string;
  status: "new" | "learning" | "mastered";
  type: string;
  folderId: string; // Liên kết với folder
}

interface FolderData {
  id: string;
  name: string;
  color: string;
  iconColor: string;
}

const mockFolders: FolderData[] = [
  {
    id: "ielts",
    name: "IELTS Core",
    color: "bg-rose-50 border-rose-200 hover:border-rose-400",
    iconColor: "text-rose-600 bg-rose-100",
  },
  {
    id: "travel",
    name: "Du lịch",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    iconColor: "text-blue-600 bg-blue-100",
  },
  {
    id: "business",
    name: "Công sở",
    color: "bg-teal-50 border-teal-200 hover:border-teal-400",
    iconColor: "text-teal-600 bg-teal-100",
  },
];

const savedVocab: VocabItem[] = [
  {
    id: 1,
    front: "Serendipity",
    back: "Sự tình cờ may mắn",
    example: "Finding this shop was pure serendipity.",
    status: "mastered",
    type: "noun",
    folderId: "ielts",
  },
  {
    id: 2,
    front: "Ephemeral",
    back: "Phù du",
    example: "Fashions are ephemeral.",
    status: "learning",
    type: "adj",
    folderId: "ielts",
  },
  {
    id: 3,
    front: "Itinerary",
    back: "Lịch trình",
    example: "Check the travel itinerary.",
    status: "new",
    type: "noun",
    folderId: "travel",
  },
  {
    id: 4,
    front: "Agenda",
    back: "Chương trình nghị sự",
    status: "new",
    type: "noun",
    folderId: "business",
  },
  {
    id: 5,
    front: "Passport",
    back: "Hộ chiếu",
    status: "mastered",
    type: "noun",
    folderId: "travel",
  },
  {
    id: 6,
    front: "Deadline",
    back: "Hạn chót",
    status: "learning",
    type: "noun",
    folderId: "business",
  },
];

// --- MOCK DATA BÀI HỌC CHÍNH KHÓA (Giữ nguyên) ---
const curriculumSets = [
  {
    id: 101,
    name: "Unit 1 - Cơ bản",
    description: "Chào hỏi, số đếm",
    cards: [
      {
        id: 1011,
        front: "Hello",
        back: "Xin chào",
        status: "new",
        type: "noun",
        folderId: "unit1",
      },
      {
        id: 1012,
        front: "Goodbye",
        back: "Tạm biệt",
        status: "new",
        type: "noun",
        folderId: "unit1",
      },
    ],
  },
  {
    id: 102,
    name: "Unit 2 - Gia đình",
    description: "Thành viên gia đình",
    cards: [
      {
        id: 1021,
        front: "Father",
        back: "Bố",
        status: "new",
        type: "noun",
        folderId: "unit2",
      },
    ],
  },
];

export default function FlashcardPracticePage() {
  const navigate = useNavigate();

  // State quản lý
  const [selectedSet, setSelectedSet] = useState<VocabItem[] | null>(null);
  const [setName, setSetName] = useState("");
  const [deckColor, setDeckColor] = useState("indigo"); // Để đổi màu theme khi học

  // State học
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    mastered: 0,
    learning: 0,
    new: 0,
  });

  // --- LOGIC CHỌN BỘ THẺ ---

  const startSession = (
    cards: VocabItem[],
    name: string,
    color: string = "indigo"
  ) => {
    if (cards.length === 0) {
      alert("Không có thẻ nào trong mục này!");
      return;
    }
    setSelectedSet(cards);
    setSetName(name);
    setDeckColor(color);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // --- MÀN HÌNH CHỌN (SELECTION SCREEN) ---
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
                startSession(savedVocab, "Tất cả từ vựng", "indigo")
              }
              className="bg-card border-2 border-indigo-200 dark:border-indigo-900 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all hover:border-indigo-400 group flex items-center gap-4"
            >
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Ôn tập tất cả</h3>
                <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  {savedVocab.length} thẻ
                </p>
              </div>
            </div>

            <div
              onClick={() =>
                startSession(
                  savedVocab.filter((v) => v.status === "new"),
                  "Từ mới chưa học",
                  "blue"
                )
              }
              className="bg-card border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all hover:border-blue-400 group flex items-center gap-4"
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Từ mới</h3>
                <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  {savedVocab.filter((v) => v.status === "new").length} thẻ
                </p>
              </div>
            </div>

            <div
              onClick={() =>
                startSession(
                  savedVocab.filter((v) => v.status === "learning"),
                  "Đang ghi nhớ",
                  "yellow"
                )
              }
              className="bg-card border-2 border-yellow-200 dark:border-yellow-900 rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all hover:border-yellow-400 group flex items-center gap-4"
            >
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Đang học</h3>
                <p className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  {savedVocab.filter((v) => v.status === "learning").length} thẻ
                </p>
              </div>
            </div>
          </div>

          {/* 1.2 Folder Decks (Lọc theo Folder) */}
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-6 mb-3">
            Theo Thư mục
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockFolders.map((folder) => {
              const count = savedVocab.filter(
                (v) => v.folderId === folder.id
              ).length;
              return (
                <div
                  key={folder.id}
                  onClick={() =>
                    startSession(
                      savedVocab.filter((v) => v.folderId === folder.id),
                      folder.name,
                      "slate"
                    )
                  }
                  className={`
                    flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer hover:-translate-y-1 transition-all
                    ${folder.color} bg-white dark:bg-slate-900
                  `}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${folder.iconColor}`}
                  >
                    <Folder className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground truncate">
                      {folder.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-bold">
                      {count} thẻ
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: BÀI HỌC CHÍNH KHÓA */}
        <section className="space-y-4 pt-6 border-t-2 border-dashed border-border">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Bài học theo lộ trình
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curriculumSets.map((set) => (
              <div
                key={set.id}
                onClick={() =>
                  startSession(set.cards as VocabItem[], set.name, "primary")
                }
                className="bg-card border-2 border-border rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all hover:border-primary group flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                  {set.id % 100}
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {set.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {set.description}
                  </p>
                  <p className="text-xs font-bold text-primary mt-1">
                    {set.cards.length} từ vựng
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // --- LOGIC HỌC FLASHCARD (SESSION SCREEN) ---
  const currentCard = selectedSet[currentIndex];
  const progressPercent = ((currentIndex + 1) / selectedSet.length) * 100;

  // Helper để đổi màu theme dựa trên deckColor
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
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      alert(
        `Hoàn thành! \nĐã thuộc: ${sessionStats.mastered} \nĐang học: ${sessionStats.learning} \nCần ôn: ${sessionStats.new}`
      );
      setSelectedSet(null);
      setSessionStats({ mastered: 0, learning: 0, new: 0 });
    }
  };

  const updateStatus = (status: "mastered" | "learning" | "new") => {
    setSessionStats((prev) => ({ ...prev, [status]: prev[status] + 1 }));
    handleNext();
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
            <span className="absolute top-6 left-6 px-3 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-bold uppercase">
              {currentCard.type}
            </span>
            <h2 className="text-5xl font-black text-foreground mb-4 text-center">
              {currentCard.front}
            </h2>
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
              {currentCard.back}
            </h2>
            {currentCard.example && (
              <div className="mt-4 p-4 bg-background/60 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <p className="text-center italic text-muted-foreground">
                  "{currentCard.example}"
                </p>
              </div>
            )}
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
              updateStatus("new");
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
              updateStatus("learning");
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
              updateStatus("mastered");
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
