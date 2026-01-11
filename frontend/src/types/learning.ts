type LessonInTopicStatus = "available" | "completed" | "locked"
type TopicStatus = "completed" | "current" | "locked"
type LessonStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED" | "DELETED"


export interface TopicsResponse {
  topics: TopicProgressOut[];
}

export interface TopicProgressOut {
  id: number;
  name: string;
  description: string;
  status: TopicStatus;
  progress: number;
}

export interface TopicLessonsResponse {
  topicId: number;
  lessons: TopicInTopicOut[];
}

export interface TopicInTopicOut {
  id: number;
  type: string;
  title: string;
  description?: string;
  progress: number;
  status: LessonInTopicStatus;
  order_index: number;
}

export interface LessonSectionSummary {
  id: number;
  title: string;
  order_index: number;
  question_count: number;
  completed: boolean;
}

export interface LessonSectionsResponse {
  lesson_id: number;
  sections: LessonSectionSummary[];
}

export interface LessonInTopicOut {
  id: number;
  type: string;
  title: string;
  description?: string;
  progress: number;
  status: LessonInTopicStatus;
  order_index: number;
}
