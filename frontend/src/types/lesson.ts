type QuestionType = 'MCQ' | 'MULTIPLE_SELECT' | 'FILL_IN_THE_BLANK' | 'MATCHING' | 'TRANSCRIPT' | 'ORDERING' | 'TRUE_FALSE';


export interface SectionQuestionsResponse {
  section_id: number;
  questions: QuestionInfo[];
}

export interface QuestionInfo {
  id: number;
  lesson_id: number;
  section_id: number;
  type: QuestionType;
  content?: Record<string, any> | null;
  audio_url?: string | null;
  explanation?: string | null;
  order_index: number;
  created_at: string;
}

export interface QuestionAnswerSubmitResponse {
  question_id: number;
  section_id: number;
  is_correct: boolean;
  correct_answer?: Record<string, any> | null;
  learning_state: LearningState;
}

export interface QuestionAnswerSubmitRequest {
  answer: Record<string, any>;
}

export interface LearningState {
  energy: number;
}

export type NextSectionResponse = NextSectionAvailable | NextSectionCompleted;

export interface NextSectionAvailable {
  lesson_id: number;
  section: LessonSectionOut;
}

export interface NextSectionCompleted {
  status: "completed";
  message: string;
}

export interface LessonSectionOut {
  id: number;
  lesson_id: number;
  title: string;
  order_index: number;
  content?: Record<string, any> | null;
  created_at: string;
}

export interface CompleteSectionResponse {
  lesson_id: number;
  section_id: number;
  score: number;
  xp: number;
  streak?: number | null;
}

export interface CompleteSectionRequest {
  score: number;
}

export interface LessonContentResponse {
  id: number;
  title: string;
  type: string;
  content?: Record<string, any> | null;
  audio_url?: string | null;
  image_url?: string | null;
}
