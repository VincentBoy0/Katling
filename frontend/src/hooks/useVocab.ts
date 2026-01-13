import vocabService from "@/services/vocabService";
import {
  ReviewStatus,
  UserWordWithVocabOut,
  VocabSearchResponse,
} from "@/types/vocab";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function useVocab() {
  const [activeTab, setActiveTab] = useState<"dictionary" | "library">(
    "dictionary"
  );

  const [dictResult, setDictResult] = useState<VocabSearchResponse | null>(
    null
  );
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
      const detail = e.response?.data?.detail;
      const message = detail === "Word not found" ? "Không tìm thấy từ" : (detail ?? "Không tìm thấy từ");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWord = async (category?: string) => {
    if (!dictResult) return;

    try {
      await vocabService.saveUserWord({
        word: dictResult.word,
        definition: dictResult.definition,
        phonetic: dictResult.phonetic,
        audio_url: dictResult.audio_url,
        category,
      });

      toast.success("Đã lưu từ vựng", {
        description: `"${dictResult.word}" đã được thêm vào kho từ vựng của bạn`,
        duration: 2000,
        dismissible: true,
      });

      // Always refresh savedWords to update folders list
      const res = await vocabService.listUserWords();
      setSavedWords(res);
    } catch (e: any) {
      toast.error("Không thể lưu từ vựng", {
        description: e.response?.data?.detail ?? "Vui lòng thử lại",
      });
    }
  };

  const deleteWord = async (userWordId: number) => {
    try {
      const wordToDelete = savedWords.find((w) => w.id === userWordId);
      await vocabService.deleteUserWord(userWordId);
      setSavedWords((prev) => prev.filter((w) => w.id !== userWordId));

      toast.success("Đã xóa từ vựng", {
        description: wordToDelete
          ? `"${wordToDelete?.word}" đã được xóa khỏi thư viện`
          : undefined,
      });
    } catch (e: any) {
      toast.error("Không thể xóa từ vựng", {
        description: e.response?.data?.detail ?? "Vui lòng thử lại",
      });
    }
  };

  const promote = async (userWordId: number) => {
    const data = await vocabService.promoteUserWord(userWordId);
    setSavedWords((prev) =>
      prev.map((w) =>
        w.id === userWordId ? { ...w, review_status: data.review_status } : w
      )
    );
  };

  // Load saved words on mount to have folders available for dictionary tab
  useEffect(() => {
    vocabService.listUserWords().then((res) => {
      setSavedWords(res);
    });
  }, []);

  // Reload when switching to library tab to get latest data
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
