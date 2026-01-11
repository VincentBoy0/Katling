import {
  assessPronunciation,
  generateMaterial,
} from "@/services/pronunciationService";
import { PracticeItem } from "@/types/pronunciation";
import { useCallback, useEffect, useState } from "react";

export function usePronunciation(
  total: number,
  mode: "word" | "sentence",
  topic: string = "daily"
) {
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [errorsMap, setErrorsMap] = useState<Record<number, any[]>>({});

  // Load items
  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await generateMaterial({
        level: "beginner",
        topic,
        count: total,
        mode,
      });

      setItems(items.items);
      setCurrentIndex(0);
      setResults({});
      setCompleted([]);
      setFeedbacks({});
      setErrorsMap({});
      setLoading(false);
    }
    load();
  }, [total, mode, topic]);

  const reset = useCallback(() => {
    setItems([]);
    setCurrentIndex(0);
    setResults({});
    setCompleted([]);
    setFeedbacks({});
    setErrorsMap({});
  }, []);

  const assess = async (audio: Blob) => {
    const ref = items[currentIndex].text;
    const res = await assessPronunciation(audio, ref);
    const scorePercent = Math.round(res.assessment.score * 10);

    setResults((prev) => ({ ...prev, [currentIndex]: scorePercent }));
    setCompleted((prev) =>
      prev.includes(currentIndex) ? prev : [...prev, currentIndex]
    );

    setFeedbacks((prev) => ({
      ...prev,
      [currentIndex]: res.feedback,
    }));

    setErrorsMap((prev) => ({
      ...prev,
      [currentIndex]: res.assessment.errors || [],
    }));

    return res;
  };

  const next = () => setCurrentIndex((i) => i + 1);
  const retry = () =>
    setResults((prev) => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });

  return {
    items,
    currentIndex,
    currentItem: items[currentIndex],
    results,
    completed,
    feedbacks,
    errorsMap,
    assess,
    next,
    retry,
    reset,
    loading,
  };
}
