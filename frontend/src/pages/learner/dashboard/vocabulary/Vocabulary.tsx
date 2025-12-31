"use client";

import { useState } from "react";
import {
  Search,
  Volume2,
  BookOpen,
  Plus,
  Trash2,
  Bookmark,
  Sparkles,
  Library,
  Loader2,
  Filter,
  CheckCircle2,
  FolderPlus,
  Folder,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// --- TYPES ---
interface DictionaryResult {
  word: string;
  phonetic?: string;
  phonetics: { text?: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}

interface SavedWord {
  id: number;
  word: string;
  phonetic: string;
  type: string;
  meaning: string;
  example: string;
  category: "new" | "learning" | "mastered";
  folderId: string; // Liên kết với Folder
  addedAt: Date;
}

interface VocabFolder {
  id: string;
  name: string;
  color: string; // Lưu class màu (vd: bg-blue-100)
}

// --- MOCK DATA ---
const INITIAL_FOLDERS: VocabFolder[] = [
  {
    id: "default",
    name: "Chung",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    id: "ielts",
    name: "IELTS Core",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
  {
    id: "travel",
    name: "Du lịch",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
];

const INITIAL_SAVED_WORDS: SavedWord[] = [
  {
    id: 1,
    word: "Serendipity",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    type: "noun",
    meaning: "Sự tình cờ may mắn",
    example: "Finding this shop was pure serendipity.",
    category: "new",
    folderId: "default",
    addedAt: new Date(),
  },
  {
    id: 2,
    word: "Ephemeral",
    phonetic: "/ɪˈfem.ər.əl/",
    type: "adjective",
    meaning: "Phù du, ngắn ngủi",
    example: "Fashions are ephemeral.",
    category: "learning",
    folderId: "ielts",
    addedAt: new Date(),
  },
];

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState<"dictionary" | "library">(
    "dictionary"
  );

  // Data States
  const [folders, setFolders] = useState<VocabFolder[]>(INITIAL_FOLDERS);
  const [savedWords, setSavedWords] =
    useState<SavedWord[]>(INITIAL_SAVED_WORDS);

  // Dictionary States
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [error, setError] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false); // Dialog chọn folder
  const [newFolderName, setNewFolderName] = useState("");

  // Library Filter States
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<
    "all" | "new" | "learning" | "mastered"
  >("all");

  // --- TRA TỪ ĐIỂN ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setDictResult(null);
    setError("");

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${searchQuery}`
      );
      if (!res.ok) throw new Error("Không tìm thấy từ này.");
      const data = await res.json();
      setDictResult(data[0]);
    } catch (err) {
      setError("Không tìm thấy từ vựng này.");
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (url?: string) => {
    if (url) {
      new Audio(url).play();
    } else {
      toast.error("Không có file âm thanh");
    }
  };

  // --- XỬ LÝ FOLDER ---
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: VocabFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      // Random màu pastel cho vui mắt
      color: [
        "bg-orange-100 text-orange-700 border-orange-200",
        "bg-purple-100 text-purple-700 border-purple-200",
        "bg-teal-100 text-teal-700 border-teal-200",
      ][Math.floor(Math.random() * 3)],
    };

    setFolders([...folders, newFolder]);
    setNewFolderName("");
    toast.success(`Đã tạo folder "${newFolder.name}"`);
  };

  // --- LƯU TỪ VÀO FOLDER CỤ THỂ ---
  const handleSaveToFolder = (folderId: string) => {
    if (!dictResult) return;

    if (
      savedWords.some(
        (w) => w.word.toLowerCase() === dictResult.word.toLowerCase()
      )
    ) {
      toast.warning("Từ này đã tồn tại trong kho!");
      setIsSaveDialogOpen(false);
      return;
    }

    const firstMeaning = dictResult.meanings[0];
    const newWord: SavedWord = {
      id: Date.now(),
      word: dictResult.word,
      phonetic: dictResult.phonetic || "",
      type: firstMeaning.partOfSpeech,
      meaning: firstMeaning.definitions[0].definition,
      example: firstMeaning.definitions[0].example || "No example",
      category: "new",
      folderId: folderId, // Lưu ID folder được chọn
      addedAt: new Date(),
    };

    setSavedWords([newWord, ...savedWords]);
    setIsSaveDialogOpen(false);
    toast.success("Đã lưu từ vựng thành công!");
  };

  const handleDeleteWord = (id: number) => {
    setSavedWords(savedWords.filter((w) => w.id !== id));
    toast.success("Đã xóa từ vựng");
  };

  const handleChangeCategory = (
    id: number,
    newCat: "new" | "learning" | "mastered"
  ) => {
    setSavedWords(
      savedWords.map((w) => (w.id === id ? { ...w, category: newCat } : w))
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            Từ điển & Kho từ
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Tra cứu và tổ chức từ vựng theo cách của bạn.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === "dictionary" ? "outline" : "ghost"}
            onClick={() => setActiveTab("dictionary")}
            className="px-6 py-2.5 rounded-xl font-bold"
          >
            <Search className="w-4 h-4" />
            Tra từ điển
          </Button>

          <Button
            variant={activeTab === "library" ? "outline" : "ghost"}
            onClick={() => setActiveTab("library")}
            className="px-6 py-2.5 rounded-xl font-bold"
          >
            <Library className="w-4 h-4" />
            Đã lưu
          </Button>
        </div>
      </div>

      {/* TAB 1: DICTIONARY */}
      {activeTab === "dictionary" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {/* Icon search nằm trong input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />

              <Input
                placeholder="Nhập từ cần tra (VD: Resilience)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-14 h-12 text-lg font-medium rounded-2xl border-2 
                 border-primary/20 bg-card"
              />
            </div>

            <Button
              size="lg"
              onClick={handleSearch}
              disabled={isLoading}
              className="rounded-xl font-bold h-12 px-6"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Tra cứu"}
            </Button>
          </div>

          {error && (
            <div className="text-center py-10 text-muted-foreground font-bold">
              {error}
            </div>
          )}

          {dictResult && !error && (
            <Card className="max-w-2xl mx-auto p-6 md:p-8 border-2 border-indigo-200 dark:border-indigo-900 bg-card rounded-3xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-foreground mb-2">
                    {dictResult.word}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                      {dictResult.phonetic || dictResult.phonetics[0]?.text}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full hover:bg-indigo-100 text-indigo-600"
                      onClick={() =>
                        playAudio(
                          dictResult.phonetics.find((p) => p.audio)?.audio
                        )
                      }
                    >
                      <Volume2 className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                {/* SAVE BUTTON WITH DIALOG */}
                <Dialog
                  open={isSaveDialogOpen}
                  onOpenChange={setIsSaveDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2 font-bold bg-emerald-500 hover:bg-emerald-600 border-emerald-700 active:border-b-0 active:translate-y-1">
                      <Plus className="w-5 h-5" /> Lưu từ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md border-2 border-border rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">
                        Lưu vào đâu?
                      </DialogTitle>
                      <DialogDescription>
                        Chọn folder hoặc tạo mới để lưu từ vựng này.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-1">
                        {folders.map((folder) => (
                          <div
                            key={folder.id}
                            onClick={() => handleSaveToFolder(folder.id)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-2 ${folder.color}`}
                          >
                            <Folder className="w-5 h-5 fill-current opacity-50" />
                            <span className="font-bold truncate">
                              {folder.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Input
                          placeholder="Tên folder mới..."
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          className="h-10"
                        />
                        <Button
                          onClick={handleCreateFolder}
                          size="icon"
                          variant="outline"
                          className="h-10 w-10 shrink-0 border-2"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {dictResult.meanings.slice(0, 3).map((meaning, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/30 p-4 rounded-2xl border border-border"
                  >
                    <div className="inline-block px-2 py-1 bg-white dark:bg-slate-800 border border-border rounded-md text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                      {meaning.partOfSpeech}
                    </div>
                    <p className="font-medium text-lg text-foreground">
                      • {meaning.definitions[0].definition}
                    </p>
                    {meaning.definitions[0].example && (
                      <p className="text-muted-foreground italic pl-4 border-l-2 border-primary/20 mt-1">
                        "{meaning.definitions[0].example}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: LIBRARY (Đã Lưu) */}
      {activeTab === "library" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* FOLDER FILTER */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">
              Danh mục
            </h3>

            <div className="flex flex-wrap gap-3">
              {/* Nút "Tất cả" */}
              <Button
                variant={selectedFolderId === "all" ? "folderActive" : "folder"}
                className={
                  selectedFolderId === "all"
                    ? "bg-slate-800 text-white border-slate-950"
                    : ""
                }
                onClick={() => setSelectedFolderId("all")}
              >
                <Library className="w-5 h-5" /> Tất cả
              </Button>

              {/* Folder items */}
              {folders.map((folder) => {
                const isActive = selectedFolderId === folder.id;

                return (
                  <Button
                    key={folder.id}
                    variant={isActive ? "folderActive" : "folder"}
                    className={isActive ? `${folder.color} border-current` : ""}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <Folder className="w-5 h-5" /> {folder.name}
                  </Button>
                );
              })}

              {/* Add folder button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="px-4 py-3 rounded-2xl border-dashed border-muted-foreground/30 text-muted-foreground hover:text-primary hover:border-primary font-bold"
                  >
                    <FolderPlus className="w-5 h-5" /> Tạo mới
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md border-2 border-border rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Tạo Folder mới</DialogTitle>
                  </DialogHeader>

                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Tên folder..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <Button onClick={handleCreateFolder}>Tạo</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* STATUS FILTER (Level 2 Filter) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-2 border-border/50 pt-2">
            <Filter className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />

            <Button
              variant={
                filterCategory === "all" ? "filterStatusLearning" : "filter"
              }
              size="sm"
              className="capitalize"
              onClick={() => setFilterCategory("all")}
            >
              Tất cả trạng thái
            </Button>

            <Button
              variant={
                filterCategory === "new" ? "filterStatusLearning" : "filter"
              }
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setFilterCategory("new")}
            >
              <Sparkles className="w-3 h-3" /> Từ mới
            </Button>

            <Button
              variant={
                filterCategory === "learning"
                  ? "filterStatusLearning"
                  : "filter"
              }
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setFilterCategory("learning")}
            >
              <Bookmark className="w-3 h-3" /> Đang học
            </Button>

            <Button
              variant={
                filterCategory === "mastered"
                  ? "filterStatusMastered"
                  : "filter"
              }
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setFilterCategory("mastered")}
            >
              <CheckCircle2 className="w-3 h-3" /> Đã thuộc
            </Button>
          </div>

          {/* WORD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedWords
              .filter(
                (w) =>
                  (selectedFolderId === "all" ||
                    w.folderId === selectedFolderId) &&
                  (filterCategory === "all" || w.category === filterCategory)
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-card border-2 border-border rounded-2xl p-6 hover:-translate-y-1 transition-all hover:shadow-md flex flex-col"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    {/* Folder Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border bg-background text-muted-foreground uppercase`}
                    >
                      {folders.find((f) => f.id === item.folderId)?.name ||
                        "Deleted"}
                    </span>
                    {/* Status Badge */}
                    {item.category === "new" && (
                      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                        Mới
                      </span>
                    )}
                    {item.category === "learning" && (
                      <span className="bg-yellow-100 text-yellow-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                        Đang học
                      </span>
                    )}
                    {item.category === "mastered" && (
                      <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                        Thuộc
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-foreground">
                      {item.word}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-mono text-muted-foreground">
                        {item.phonetic}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground/60 border border-border px-1.5 rounded uppercase">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 mb-6">
                    <p className="font-bold text-primary">{item.meaning}</p>
                    <p className="text-sm text-muted-foreground italic truncate">
                      "{item.example}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dashed border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      onClick={() => handleDeleteWord(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1">
                      {item.category !== "mastered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-bold border-green-200 hover:bg-green-50 hover:text-green-600"
                          onClick={() =>
                            handleChangeCategory(item.id, "mastered")
                          }
                        >
                          <Check className="w-3 h-3 mr-1" /> Thuộc
                        </Button>
                      )}
                      {item.category === "new" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-bold border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600"
                          onClick={() =>
                            handleChangeCategory(item.id, "learning")
                          }
                        >
                          Học
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Empty State */}
          {savedWords.filter(
            (w) =>
              (selectedFolderId === "all" || w.folderId === selectedFolderId) &&
              (filterCategory === "all" || w.category === filterCategory)
          ).length === 0 && (
            <div className="text-center py-20 opacity-50">
              <Library className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="font-bold text-lg">
                Chưa có từ vựng nào trong mục này
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
