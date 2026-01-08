import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import vocabService from "@/services/vocabService";
import { ReviewStatus, UserWordWithVocabOut, VocabSearchResponse } from "@/types/vocab";


export function useVocab() {
  const [activeTab, setActiveTab] = useState<"dictionary" | "library">(
    "dictionary"
  );

  const [dictResult, setDictResult] = useState<VocabSearchResponse | null>(null);
  const [savedWords, setSavedWords] = useState<UserWordWithVocabOut[]>([]);
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
      const data = await vocabService.search(searchQuery);
      setDictResult(data);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Không tìm thấy từ");
    } finally {
      setIsLoading(false);
    }
  };

  const saveWord = async (category?: string) => {
    if (!dictResult) return;

    await vocabService.saveUserWord({
      word: dictResult.word,
      definition: dictResult.definition,
      phonetic: dictResult.phonetic,
      audio_url: dictResult.audio_url,
      category,
    });

    toast.success("Đã lưu từ vựng");

    if (activeTab === "library") {
      const res = await vocabService.listUserWords();
      setSavedWords(res);
    }
  };

  const deleteWord = async (userWordId: number) => {
    await vocabService.deleteUserWord(userWordId);
    setSavedWords((prev) => prev.filter((w) => w.id !== userWordId));
  };

  const promote = async (userWordId: number) => {
    const data = await vocabService.promoteUserWord(userWordId);
    setSavedWords((prev) =>
      prev.map((w) =>
        w.id === userWordId ? { ...w, review_status: data.review_status } : w
      )
    );
  };

  useEffect(() => {
    if (activeTab === "library") {
      vocabService.listUserWords().then((res) => {
        setSavedWords(res);
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
