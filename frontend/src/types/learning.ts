type LessonInTopicStatus = "available" | "completed"
type TopicStatus = "completed" | "current" | "locked"


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
  progress: number;
  status: LessonInTopicStatus;
}
