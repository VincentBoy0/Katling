import { QuestionType } from "@/types/content";

export const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  [QuestionType.MCQ]: "bg-blue-500/10 text-blue-600",
  [QuestionType.MULTIPLE_SELECT]: "bg-green-500/10 text-green-600",
  [QuestionType.TRUE_FALSE]: "bg-teal-500/10 text-teal-600",
  [QuestionType.FILL_IN_THE_BLANK]: "bg-purple-500/10 text-purple-600",
  [QuestionType.MATCHING]: "bg-orange-500/10 text-orange-600",
  [QuestionType.ORDERING]: "bg-indigo-500/10 text-indigo-600",
  [QuestionType.PRONUNCIATION]: "bg-violet-500/10 text-violet-600",
  [QuestionType.TRANSCRIPT]: "bg-pink-500/10 text-pink-600",
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.MCQ]: "MCQ",
  [QuestionType.MULTIPLE_SELECT]: "Multiple Select",
  [QuestionType.TRUE_FALSE]: "True/False",
  [QuestionType.FILL_IN_THE_BLANK]: "Fill in the blank",
  [QuestionType.MATCHING]: "Matching",
  [QuestionType.ORDERING]: "Ordering",
  [QuestionType.PRONUNCIATION]: "Pronunciation",
  [QuestionType.TRANSCRIPT]: "Transcript",
};

export const getQuestionTypeColor = (type: QuestionType): string => {
  return QUESTION_TYPE_COLORS[type] || "bg-gray-500/10 text-gray-600";
};

export const getQuestionTypeLabel = (type: QuestionType): string => {
  return QUESTION_TYPE_LABELS[type] || type;
};
