import { QuestionType } from "@/types/content";

export interface QuestionFormData {
  type: QuestionType;
  explanation?: string;
  order_index: number;
  audio_url?: string;
  questionText?: string;
  options?: string[];
  correctAnswer?: string;
  leftItems?: string[];
  rightItems?: string[];
  correctAnswers?: string[];
}

export const getInitialFormData = (sectionId?: number): QuestionFormData => ({
  type: QuestionType.MCQ,
  explanation: "",
  order_index: 0,
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  leftItems: ["", ""],
  rightItems: ["", ""],
  correctAnswers: [],
});

export const buildQuestionData = (formData: QuestionFormData) => {
  let content: Record<string, any> = {};
  let correct_answer: Record<string, any> = {};

  switch (formData.type) {
    case QuestionType.MCQ:
      content = {
        question: formData.questionText,
        options: formData.options?.filter((opt) => opt.trim() !== ""),
      };
      correct_answer = {
        answer: formData.correctAnswer,
      };
      break;

    case QuestionType.MULTIPLE_SELECT:
      content = {
        question: formData.questionText,
        options: formData.options?.filter((opt) => opt.trim() !== ""),
      };
      correct_answer = {
        answers: formData.correctAnswers || [],
      };
      break;

    case QuestionType.TRUE_FALSE:
      content = {
        question: formData.questionText,
      };
      correct_answer = {
        answer: formData.correctAnswer === "true",
      };
      break;

    case QuestionType.FILL_IN_THE_BLANK:
      content = {
        text: formData.questionText,
      };
      correct_answer = {
        answers: formData.correctAnswer?.split(",").map((a) => a.trim()),
      };
      break;

    case QuestionType.MATCHING:
      const pairs = (formData.leftItems || [])
        .map((left, index) => ({
          left: left.trim(),
          right: (formData.rightItems?.[index] || "").trim(),
        }))
        .filter((pair) => pair.left && pair.right);
      content = {
        question: formData.questionText,
        pairs: pairs,
      };
      correct_answer = {
        pairs: pairs,
      };
      break;

    case QuestionType.ORDERING:
      const validItems = formData.options?.filter((opt) => opt.trim() !== "") || [];
      content = {
        question: formData.questionText,
        items: validItems,
      };
      // The order is sequential (0, 1, 2, ...) since items are arranged in correct order
      correct_answer = {
        order: validItems.map((_, index) => index),
      };
      break;

    case QuestionType.PRONUNCIATION:
      content = {
        text: formData.questionText,
      };
      correct_answer = {
        text: formData.correctAnswer || formData.questionText,
      };
      break;

    case QuestionType.TRANSCRIPT:
      content = {
        text: formData.questionText,
      };
      correct_answer = {
        text: formData.correctAnswer,
      };
      break;

    default:
      content = { question: formData.questionText };
      correct_answer = { answer: formData.correctAnswer };
  }

  return { content, correct_answer };
};

export const parseQuestionToFormData = (question: any): QuestionFormData => {
  const content = question.content || {};
  const correctAnswer = question.correct_answer || {};

  let editData: QuestionFormData = {
    type: question.type,
    explanation: question.explanation || "",
    order_index: question.order_index,
    audio_url: question.audio_url || "",
    questionText: content.question || content.text || "",
    options: content.options || ["", "", "", ""],
    correctAnswer: "",
    leftItems: ["", ""],
    rightItems: ["", ""],
    correctAnswers: [],
  };

  switch (question.type) {
    case QuestionType.MULTIPLE_SELECT:
      editData.correctAnswers = correctAnswer.answers || [];
      break;

    case QuestionType.MATCHING:
      const pairs = content.pairs || [];
      editData.leftItems = pairs.map((p: any) => p.left || "");
      editData.rightItems = pairs.map((p: any) => p.right || "");
      if (pairs.length === 0) {
        editData.leftItems = ["", ""];
        editData.rightItems = ["", ""];
      }
      break;

    case QuestionType.ORDERING:
      // Reorder items based on the stored correct order
      const storedItems = content.items || [];
      const storedOrder = correctAnswer.order || [];
      if (storedOrder.length > 0 && storedItems.length > 0) {
        // Reconstruct items in correct order for editing
        editData.options = storedOrder.map((idx: number) => storedItems[idx] || "");
      } else {
        editData.options = storedItems.length > 0 ? storedItems : ["", "", "", ""];
      }
      break;

    case QuestionType.TRUE_FALSE:
      editData.correctAnswer = String(correctAnswer.answer);
      break;

    case QuestionType.FILL_IN_THE_BLANK:
      editData.correctAnswer = (correctAnswer.answers || []).join(", ");
      break;

    default:
      editData.correctAnswer = correctAnswer.answer || correctAnswer.text || "";
  }

  return editData;
};

export const resetFormDataForType = (
  currentData: QuestionFormData,
  newType: QuestionType
): QuestionFormData => {
  return {
    ...currentData,
    type: newType,
    questionText: "",
    options:
      newType === QuestionType.TRUE_FALSE || newType === QuestionType.MATCHING
        ? []
        : ["", "", "", ""],
    correctAnswer: "",
    leftItems: ["", ""],
    rightItems: ["", ""],
    correctAnswers: [],
  };
};
