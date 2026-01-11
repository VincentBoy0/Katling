import lessonService from "@/services/lessonService";
import { userService } from "@/services/userService";
import {
  CompleteSectionResponse,
  QuestionAnswerSubmitResponse,
  QuestionInfo,
} from "@/types/lesson";
import { useEffect, useState } from "react";

export function useLesson(
  lessonId: number,
  initialSectionId?: number,
  isReview: boolean = false
) {
  const [questions, setQuestions] = useState<QuestionInfo[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionId, setSectionId] = useState<number | null>(
    initialSectionId || null
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [completionData, setCompletionData] =
    useState<CompleteSectionResponse | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [answerResults, setAnswerResults] = useState<
    Map<number, QuestionAnswerSubmitResponse>
  >(new Map());
  const [energy, setEnergy] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);

        // If sectionId is provided, load that specific section
        if (initialSectionId) {
          const res = await lessonService.getSectionQuestions(initialSectionId);
          // Fetch energy ban đầu
          try {
            const pointsRes = await userService.getUserPoints();
            if (mounted) {
              setEnergy(pointsRes.data.energy);
            }
          } catch {
            // Ignore error, energy sẽ được cập nhật sau khi submit answer
          }
          if (mounted) {
            setSectionId(initialSectionId);
            setQuestions(res.questions);
            setCurrentStep(0);
          }
          return;
        }

        // Otherwise, get the next uncompleted section
        const next = await lessonService.getNextSection(lessonId);

        if ("status" in next && next.status === "completed") {
          setCompleted(true);
          return;
        }

        if ("section" in next) {
          setSectionId(next.section.id);

          const res = await lessonService.getSectionQuestions(next.section.id);

          // Fetch energy ban đầu
          try {
            const pointsRes = await userService.getUserPoints();
            if (mounted) {
              setEnergy(pointsRes.data.energy);
            }
          } catch {
            // Ignore error
          }

          if (mounted) {
            setQuestions(res.questions);
            setCurrentStep(0);
          }
        }
      } catch {
        if (mounted) {
          setError("Không thể tải bài học");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      mounted = false;
    };
  }, [lessonId, initialSectionId]);

  const currentQuestion = questions[currentStep];
  const progressPercent =
    questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  const submitAnswer = async (
    questionId: number,
    userAnswer: Record<string, any>
  ) => {
    try {
      setSubmitting(true);
      const result = await lessonService.submitQuestionAnswer(questionId, {
        answer: userAnswer,
      });
      setAnswerResults((prev) => new Map(prev).set(questionId, result));
      // Cập nhật energy từ learning_state
      if (result.learning_state?.energy !== undefined) {
        setEnergy(result.learning_state.energy);
      }
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      alert(err.response?.data?.detail || "Lỗi khi gửi câu trả lời");
    } finally {
      setSubmitting(false);
    }
  };

  const next = async () => {
    if (!sectionId) return;
    if (!currentQuestion) return;
    if (!answerResults.has(currentQuestion.id)) return;

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    const correct = Array.from(answerResults.values()).filter(
      (result) => result.is_correct
    ).length;

    const score = Math.round((correct / questions.length) * 100);

    // Nếu đang ôn tập (section đã completed trước đó), không gọi API complete
    if (isReview) {
      setCompletionData({
        lesson_id: lessonId,
        section_id: sectionId!,
        score,
        xp: 0, // Không nhận XP khi ôn tập
      });
      setCompleted(true);
      return;
    }

    try {
      setCompleting(true);
      const res = await lessonService.completeSection(lessonId, sectionId!, {
        score,
      });
      setCompletionData(res);
      setCompleted(true);
    } finally {
      setCompleting(false);
    }
  };

  return {
    loading,
    error,

    questions,
    currentQuestion,
    currentStep,
    progressPercent,

    submitting,
    completing,

    completed,
    completionData,

    submitAnswer,
    next,
    prev: () => setCurrentStep((s) => Math.max(s - 1, 0)),

    answerResults,
    energy,
  };
}
