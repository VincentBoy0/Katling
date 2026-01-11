import { QuestionType } from "@/types/content";

export interface QuestionFormData {
  type: QuestionType;
  explanation?: string;
  audio_url?: string;
  questionText?: string;
  options?: string[];
  correctAnswer?: string;
  leftItems?: string[];
  rightItems?: string[];
  correctAnswers?: string[];
  // For ORDERING: words = display order, arrangedWords = correct order
  arrangedWords?: string[];
  // For MATCHING: matches = correct pairs {leftIndex: rightIndex}
  matchPairs?: Record<number, number>;
}

export const getInitialFormData = (): QuestionFormData => ({
  type: QuestionType.MCQ,
  explanation: "",
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  leftItems: ["", ""],
  rightItems: ["", ""],
  correctAnswers: [],
  arrangedWords: ["", "", "", ""],
  matchPairs: {},
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
        sentence: formData.questionText,
      };
      correct_answer = {
        answer: formData.correctAnswer,
      };
      break;

    case QuestionType.MATCHING:
      // leftItems and rightItems are the content columns
      // matchPairs defines which left index matches which right index
      const validLeftItems = (formData.leftItems || []).filter(item => item.trim() !== "");
      const validRightItems = (formData.rightItems || []).filter(item => item.trim() !== "");
      const matchesObject: Record<string, string> = {};
      
      // Build matches from matchPairs
      const pairs = formData.matchPairs || {};
      Object.entries(pairs).forEach(([leftIdx, rightIdx]) => {
        const leftItem = validLeftItems[parseInt(leftIdx)];
        const rightItem = validRightItems[rightIdx as number];
        if (leftItem && rightItem) {
          matchesObject[leftItem.trim()] = rightItem.trim();
        }
      });
      
      content = {
        left: validLeftItems.map(item => item.trim()),
        right: validRightItems.map(item => item.trim()),
      };
      correct_answer = {
        matches: matchesObject,
      };
      break;

    case QuestionType.ORDERING:
      // options = words (display order for learner)
      // arrangedWords = correct order
      const displayWords = (formData.options || []).filter((opt) => opt.trim() !== "");
      const correctOrder = (formData.arrangedWords || []).filter((opt) => opt.trim() !== "");
      content = {
        words: displayWords,
      };
      correct_answer = {
        arranged_words: correctOrder.length > 0 ? correctOrder : displayWords,
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
        instruction: formData.questionText,
      };
      correct_answer = {
        transcript: formData.correctAnswer,
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
    audio_url: question.audio_url || "",
    questionText: content.question || content.text || content.instruction || content.sentence || "",
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
      const leftArray = content.left || [];
      const rightArray = content.right || [];
      const matchesObj = correctAnswer.matches || {};
      
      // Reconstruct matchPairs from matches object
      const reconstructedPairs: Record<number, number> = {};
      Object.entries(matchesObj).forEach(([leftVal, rightVal]) => {
        const leftIdx = leftArray.findIndex((l: string) => l === leftVal);
        const rightIdx = rightArray.findIndex((r: string) => r === rightVal);
        if (leftIdx !== -1 && rightIdx !== -1) {
          reconstructedPairs[leftIdx] = rightIdx;
        }
      });
      
      editData.leftItems = leftArray.length > 0 ? leftArray : ["", ""];
      editData.rightItems = rightArray.length > 0 ? rightArray : ["", ""];
      editData.matchPairs = reconstructedPairs;
      break;

    case QuestionType.ORDERING:
      // words = display order, arranged_words = correct order
      const displayWords = content.words || [];
      const arrangedWords = correctAnswer.arranged_words || [];
      editData.options = displayWords.length > 0 ? displayWords : ["", "", "", ""];
      editData.arrangedWords = arrangedWords.length > 0 ? arrangedWords : displayWords;
      break;

    case QuestionType.TRUE_FALSE:
      editData.correctAnswer = String(correctAnswer.answer);
      break;

    case QuestionType.FILL_IN_THE_BLANK:
      editData.questionText = content.sentence || "";
      editData.correctAnswer = correctAnswer.answer || "";
      break;

    default:
      editData.correctAnswer = correctAnswer.answer || correctAnswer.text || correctAnswer.transcript || "";
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
      newType === QuestionType.TRUE_FALSE || newType === QuestionType.MATCHING || newType === QuestionType.ORDERING
        ? ["", "", "", ""]
        : ["", "", "", ""],
    correctAnswer: "",
    leftItems: ["", ""],
    rightItems: ["", ""],
    correctAnswers: [],
    arrangedWords: ["", "", "", ""],
    matchPairs: {},
  };
};
