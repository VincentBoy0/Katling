import { useState, useEffect } from "react";
import lessonService from "@/services/lessonService";
import { QuestionInfo, QuestionAnswerSubmitResponse, CompleteSectionResponse } from "@/types/lesson";


export function useLesson(lessonId: number) {
  const [questions, setQuestions] = useState<QuestionInfo[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionId, setSectionId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<CompleteSectionResponse | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [answerResults, setAnswerResults] = useState<Map<number, QuestionAnswerSubmitResponse>>(new Map());

  useEffect(() => {
    let mounted = true;

    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);

        const next = await lessonService.getNextSection(lessonId);

        if ("status" in next && next.status === "completed") {
          setCompleted(true);
          return;
        }

        setSectionId(next.section.id);

        const res = await lessonService.getSectionQuestions(
          next.section.id
        );

        if (mounted) {
          setQuestions(res.questions);
          setCurrentStep(0);
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
  }, [lessonId]);

  const currentQuestion = questions[currentStep];
  const progressPercent = questions.length > 0
    ? ((currentStep + 1) / questions.length) * 100
    : 0;

  const submitAnswer = async (questionId: number, userAnswer: Record<string, any>) => {
    try {
      setSubmitting(true);
      const result = await lessonService.submitQuestionAnswer(questionId, { answer: userAnswer });
      setAnswerResults((prev) => new Map(prev).set(questionId, result));
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      alert(err.response?.data?.detail || 'Lỗi khi gửi câu trả lời');
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

    const correct = Array.from(answerResults.values()).filter(result => result.is_correct).length;

    const score = Math.round((correct / questions.length) * 100);

    try {
      setCompleting(true);
      const res = await lessonService.completeSection(
        lessonId,
        sectionId!,
        { score }
      );
      setCompletionData(res);
      setCompleted(true);
    } finally {
      setCompleting(false);
    }
  }

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
  };
}
