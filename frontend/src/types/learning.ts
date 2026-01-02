export interface QuestionContent {
  [key: string]: any;
}

export interface Question {
  id: number;
  lesson_id: number;
  section_id: number;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'FILL_IN_THE_BLANK' |
        'MATCHING' | 'TRANSCRIPT' | 'ARRANGE_WORDS';
  content: QuestionContent;
  audio_url?: string | null;
  explanation?: string | null;
  order_index: number;
  created_at: string;
}

export interface SectionQuestionsResponse {
  section_id: number;
  questions: Question[];
}

export interface AnswerSubmitRequest {
  answer: QuestionContent;
}

export interface AnswerSubmitResponse {
  question_id: number;
  section_id: number;
  is_correct: boolean;
  correct_answer?: QuestionContent | null;
}

export interface Section {
  id: number;
  lesson_id: number;
  title: string;
  description?: string;
  order_index: number;
  type: string;
}

export interface NextSectionResponse {
  status?: 'completed';
  message?: string;
  lesson_id?: number;
  section?: Section;
}

export interface TopicProgressOut {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  progress: number;
}

export interface TopicsResponse {
  topics: TopicProgressOut[];
}

export interface CompleteSectionRequest {
  score: number;
}

export interface CompleteSectionResponse {
  lesson_id: number;
  section_id: number;
  score: number;
  xp: number;
  streak: number;
}
