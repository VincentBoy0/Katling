import { useEffect, useState } from "react";
import { learningService } from "@/services/learningService";
import { TopicProgressOut } from "@/types/learning";

export function useTopics() {
  const [topics, setTopics] = useState<TopicProgressOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await learningService.getTopics();
        if (mounted) {
          setTopics(data.topics);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.response?.data?.message || "Đã có lỗi xảy ra khi tải chủ đề.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTopics();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    topics,
    loading,
    error,
  };
}
