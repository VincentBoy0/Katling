import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { vocabService } from "@/services/vocabService";
import { Library, Loader2, Plus, Search, Volume2, Trash2, Check, Folder, Filter, Sparkles, Bookmark, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/learner/dialog";


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

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState<"dictionary" | "library">("dictionary");
  const [dictResult, setDictResult] = useState<any | null>(null);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newFolderName, setNewFolderName] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "NEW" | "LEARNING" | "MASTERED">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const { data } = await vocabService.search(searchQuery);
      setDictResult(data);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Không tìm thấy từ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dictResult) return;

    await vocabService.saveWord({
      word: dictResult.word,
      definition: dictResult.definition,
      phonetic: dictResult.phonetic,
      audio_url: dictResult.audio_url,
      category: selectedCategory,
    });

    toast.success("Đã lưu từ vựng");

    if (activeTab === "library") {
      const res = await vocabService.getUserWords();
      setSavedWords(res.data);
    }
  };

  const handleDeleteWord = async (word: string) => {
    await vocabService.deleteWord(word);
    setSavedWords((prev) =>
      prev.filter((w) => w.word !== word)
    );
  };

  const handlePromote = async (vocabId: number) => {
    const { data } = await vocabService.promote(vocabId);

    setSavedWords((prev) =>
      prev.map((w) =>
        w.vocab_id === vocabId
          ? { ...w, review_status: data.review_status }
          : w
      )
    );
  };

  useEffect(() => {
    if (activeTab === "library") {
      vocabService.getUserWords().then((res) => {
        setSavedWords(res.data);
      });
    }
  }, [activeTab]);

  const folders = useMemo(() => {
    const set = new Set<string>();

    savedWords.forEach((w) => {
      if (w.category) set.add(w.category);
    });

    return Array.from(set);
  }, [savedWords]);

  const filteredWords = savedWords.filter((w) => {
    const matchCategory =
      selectedCategory === "all" || w.category === selectedCategory;

    const matchStatus =
      filterStatus === "all" || w.review_status === filterStatus;

    return matchCategory && matchStatus;
  });

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
                className="pl-14 h-12 text-lg font-medium rounded-2xl border-2 border-primary/20 bg-card"
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
                  <h2 className="text-4xl md:text-5xl font-black text-foreground mb-2">{dictResult.word}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{dictResult.phonetic}</span>
                    {dictResult.audio_url && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full hover:bg-indigo-100 text-indigo-600"
                        onClick={() => new Audio(dictResult.audio_url).play()}
                      >
                        <Volume2 className="w-6 h-6" />
                      </Button>
                    )}
                  </div>
                </div>

                <Button onClick={handleSave}>
                  <Plus className="w-4 h-4" /> Lưu
                </Button>
                {/* SAVE BUTTON WITH DIALOG */}
                <Dialog
                  open={isSaveDialogOpen}
                  onOpenChange={setIsSaveDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={handleSave} className="gap-2 font-bold bg-emerald-500 hover:bg-emerald-600 border-emerald-700 active:border-b-0 active:translate-y-1">
                      <Plus className="w-4 h-4" /> Lưu từ
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
                            key={folder}
                            onClick={() => setSelectedCategory(folder)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-2`}
                          >
                            <Folder className="w-5 h-5 fill-current opacity-50" />
                            <span className="font-bold truncate">
                              {folder}
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
                          onClick={() => {
                            if (newFolderName.trim()) {
                              setSelectedCategory(newFolderName.trim());
                              setNewFolderName("");
                            }
                          }}
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

              {/* DEFINITIONS */}
              <div className="space-y-3">
                {(Object.entries(dictResult.definition) as [string, string[]][]).map(
                  ([partOfSpeech, defs]) => (
                    <div key={partOfSpeech}>
                      <div className="font-bold uppercase text-sm text-muted-foreground">
                        {partOfSpeech}
                      </div>
                      <ul className="list-disc pl-5">
                        {defs.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
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
                variant={selectedCategory=== "all" ? "folderActive" : "folder"}
                className={
                  selectedCategory === "all"
                    ? "bg-slate-800 text-white border-slate-950"
                    : ""
                }
                onClick={() => setSelectedCategory("all")}
              >
                <Library className="w-5 h-5" /> Tất cả
              </Button>

              {/* Folder items */}
              {folders.map((folder) => {
                const isActive = selectedCategory === folder;

                return (
                  <Button
                    key={folder}
                    variant={isActive ? "folderActive" : "folder"}
                    className={isActive ? `border-current` : ""}
                    onClick={() => setSelectedCategory(folder)}
                  >
                    <Folder className="w-5 h-5" /> {folder}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* STATUS FILTER (Level 2 Filter) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-2 border-border/50 pt-2">
            <Filter className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />

            <Button
              variant={
                filterStatus === "all" ? "filterStatusLearning" : "filter"
              }
              size="sm"
              className="capitalize"
              onClick={() => setFilterStatus("all")}
            >
              Tất cả trạng thái
            </Button>

            <Button
              variant={
                filterStatus === "NEW" ? "filterStatusLearning" : "filter"
              }
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setFilterStatus("NEW")}
            >
              <Sparkles className="w-3 h-3" /> Từ mới
            </Button>

            <Button
              variant={
                filterStatus === "LEARNING"
                  ? "filterStatusLearning"
                  : "filter"
              }
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setFilterStatus("LEARNING")}
            >
              <Bookmark className="w-3 h-3" /> Đang học
            </Button>

            <Button
              variant={
                filterStatus === "MASTERED"
                  ? "filterStatusMastered"
                  : "filter"
              }
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setFilterStatus("MASTERED")}
            >
              <CheckCircle2 className="w-3 h-3" /> Đã thuộc
            </Button>
          </div>

          {/* WORD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-card border-2 border-border rounded-2xl p-6 hover:-translate-y-1 transition-all hover:shadow-md flex flex-col"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    {/* Folder Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border bg-background text-muted-foreground uppercase`}
                    >
                      {folders.find((f) => f === item.category) ||
                        "Deleted"}
                    </span>
                    {/* Status Badge */}
                    {item.category === "NEW" && (
                      <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                        Mới
                      </span>
                    )}
                    {item.category === "LEARNING" && (
                      <span className="bg-yellow-100 text-yellow-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                        Đang học
                      </span>
                    )}
                    {item.category === "MASTERED" && (
                      <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                        Thuộc
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-foreground">
                      {item.word}
                    </h3>

                    {item.phonetic && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-mono text-muted-foreground">
                          {item.phonetic}
                        </span>
                      </div>
                    )}

                    {/* definition */}
                    {item.definition &&
                      Object.entries(item.definition).map(
                        ([pos, defs]:[string, string[]]) => (
                          <p key={pos} className="text-sm">
                            <b>{pos}</b>: {(defs as string[])[0]}
                          </p>
                        )
                      )
                    }
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteWord(item.word)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex gap-1">
                      {item.review_status !== "MASTERED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-bold border-green-200 hover:bg-green-50 hover:text-green-600"
                          onClick={() => handlePromote(item.vocab_id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Nâng cấp
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {filteredWords.length === 0 && (
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
