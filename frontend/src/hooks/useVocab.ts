import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { vocabService } from "@/services/vocabService";

export type ReviewStatus = "NEWBIE" | "LEARNING" | "MASTERED";

export type SavedWord = {
  id: number;
  vocab_id: number;
  word: string;
  phonetic?: string | null;
  audio_url?: string | null;
  definition: Record<string, string[]>;
  category?: string | null;
  review_status: ReviewStatus;
  created_at: string;
};

export function useVocab() {
  const [activeTab, setActiveTab] = useState<"dictionary" | "library">(
    "dictionary"
  );

  const [dictResult, setDictResult] = useState<any | null>(null);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ReviewStatus>("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
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

  const saveWord = async (category?: string) => {
    if (!dictResult) return;

    await vocabService.saveWord({
      word: dictResult.word,
      definition: dictResult.definition,
      phonetic: dictResult.phonetic,
      audio_url: dictResult.audio_url,
      category,
    });

    toast.success("Đã lưu từ vựng");

    if (activeTab === "library") {
      const res = await vocabService.getUserWords();
      setSavedWords(res.data);
    }
  };

  const deleteWord = async (word: string) => {
    await vocabService.deleteWord(word);
    setSavedWords((prev) => prev.filter((w) => w.word !== word));
  };

  const promote = async (vocabId: number) => {
    const { data } = await vocabService.promote(vocabId);
    setSavedWords((prev) =>
      prev.map((w) =>
        w.vocab_id === vocabId ? { ...w, review_status: data.review_status } : w
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
    return Array.from(
      new Set(savedWords.map((w) => w.category).filter(Boolean))
    ) as string[];
  }, [savedWords]);

  const filteredWords = useMemo(() => {
    return savedWords.filter((w) => {
      const matchCategory =
        selectedCategory === "all" || w.category === selectedCategory;
      const matchStatus =
        filterStatus === "all" || w.review_status === filterStatus;
      return matchCategory && matchStatus;
    });
  }, [savedWords, selectedCategory, filterStatus]);

  return {
    /* state */
    activeTab,
    dictResult,
    savedWords,
    folders,
    filteredWords,
    searchQuery,
    selectedCategory,
    filterStatus,
    isLoading,
    error,

    /* setters */
    setActiveTab,
    setSearchQuery,
    setSelectedCategory,
    setFilterStatus,

    /* actions */
    search,
    saveWord,
    deleteWord,
    promote,
  };
}
