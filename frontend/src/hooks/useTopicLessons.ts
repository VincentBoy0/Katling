import { useEffect, useState } from "react";
import { learningService } from "@/services/learningService";
import { TopicInTopicOut } from "@/types/learning";

export function useTopicLessons(topicId: number) {
  const [lessons, setLessons] = useState<TopicInTopicOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (topicId <= 0) {
      setLessons([]);
      setLoading(false);
      return;
    }

    const loadLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await learningService.getTopicLessons(topicId);
        if (mounted) {
          setLessons(res.lessons);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.response?.data?.message || "Không thể tải bài học");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadLessons();

    return () => {
      mounted = false;
    };
  }, [topicId]);

  return { lessons, loading, error };
}
