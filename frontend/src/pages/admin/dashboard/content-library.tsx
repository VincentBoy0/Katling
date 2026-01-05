import { useState } from "react";
import {
  Library,
  Folder,
  BookOpen,
  FileText,
  HelpCircle,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  Topic,
  Lesson,
  LessonSection,
  LessonType,
  LessonStatus,
} from "@/types/content";
import { Question } from "@/types/learning";
import { ContentTreeItem } from "@/components/admin/content/ContentTreeItem";
import {
  StatusBadge,
  TypeBadge,
  BadgeGroup,
} from "@/components/admin/content/Badges";
import { toast } from "sonner";

interface ExpandedState {
  topics: Set<number>;
  lessons: Set<number>;
  sections: Set<number>;
  questions: Set<number>;
}

// Mock data for UI demonstration
const mockTopics: Topic[] = [
  {
    id: 1,
    created_by: 1,
    name: "Basic English",
    description: "Fundamentals of English language",
    order_index: 1,
    created_at: "2024-01-15T10:30:00Z",
    is_deleted: false,
  },
  {
    id: 2,
    created_by: 1,
    name: "Intermediate English",
    description: "Build on your English skills",
    order_index: 2,
    created_at: "2024-01-20T14:20:00Z",
    is_deleted: false,
  },
];

const mockLessons: Record<number, Lesson[]> = {
  1: [
    {
      id: 1,
      topic_id: 1,
      created_by: 1,
      type: LessonType.READING,
      title: "Introduction to Reading",
      description: "Learn basic reading skills",
      status: LessonStatus.PUBLISHED,
      order_index: 1,
      created_at: "2024-01-16T09:00:00Z",
      is_deleted: false,
    },
    {
      id: 2,
      topic_id: 1,
      created_by: 1,
      type: LessonType.VOCABULARY,
      title: "Basic Vocabulary",
      description: "Common words and phrases",
      status: LessonStatus.DRAFT,
      order_index: 2,
      created_at: "2024-01-17T11:30:00Z",
      is_deleted: false,
    },
  ],
  2: [
    {
      id: 3,
      topic_id: 2,
      created_by: 1,
      type: LessonType.GRAMMAR,
      title: "Advanced Grammar",
      description: "Complex grammar structures",
      status: LessonStatus.PENDING,
      order_index: 1,
      created_at: "2024-01-21T10:00:00Z",
      is_deleted: false,
    },
  ],
};

const mockSections: Record<number, LessonSection[]> = {
  1: [
    {
      id: 1,
      created_by: 1,
      lesson_id: 1,
      title: "Reading Comprehension Basics",
      order_index: 1,
      created_at: "2024-01-16T10:00:00Z",
      is_deleted: false,
    },
    {
      id: 2,
      created_by: 1,
      lesson_id: 1,
      title: "Practice Reading",
      order_index: 2,
      created_at: "2024-01-16T11:00:00Z",
      is_deleted: false,
    },
  ],
  2: [
    {
      id: 3,
      created_by: 1,
      lesson_id: 2,
      title: "Common Words",
      order_index: 1,
      created_at: "2024-01-17T12:00:00Z",
      is_deleted: false,
    },
  ],
};

const mockQuestions: Record<number, (Question & { is_deleted?: boolean })[]> = {
  1: [
    {
      id: 1,
      lesson_id: 1,
      section_id: 1,
      type: "MULTIPLE_CHOICE",
      content: {
        question: "What is the main idea of this passage?",
        options: ["A", "B", "C", "D"],
      },
      audio_url: "https://example.com/audio1.mp3",
      explanation: "The correct answer is A because...",
      order_index: 1,
      created_at: "2024-01-16T10:30:00Z",
      is_deleted: false,
    },
    {
      id: 2,
      lesson_id: 1,
      section_id: 1,
      type: "FILL_IN_THE_BLANK",
      content: {
        sentence: "The cat ___ on the mat.",
        answer: "sat",
      },
      order_index: 2,
      created_at: "2024-01-16T10:45:00Z",
      is_deleted: true,
    },
  ],
  2: [
    {
      id: 3,
      lesson_id: 1,
      section_id: 2,
      type: "MATCHING",
      content: {
        pairs: [
          { left: "Apple", right: "Fruit" },
          { left: "Car", right: "Vehicle" },
        ],
      },
      order_index: 1,
      created_at: "2024-01-16T11:30:00Z",
      is_deleted: false,
    },
  ],
};

export default function ContentLibrary() {
  const [topics] = useState<Topic[]>(mockTopics);
  const [lessons] = useState<Record<number, Lesson[]>>(mockLessons);
  const [sections] = useState<Record<number, LessonSection[]>>(mockSections);
  const [questions, setQuestions] =
    useState<Record<number, (Question & { is_deleted?: boolean })[]>>(
      mockQuestions
    );
  const [expanded, setExpanded] = useState<ExpandedState>({
    topics: new Set(),
    lessons: new Set(),
    sections: new Set(),
    questions: new Set(),
  });

  const toggleTopic = (topicId: number) => {
    setExpanded((prev) => {
      const newTopics = new Set(prev.topics);
      newTopics.has(topicId)
        ? newTopics.delete(topicId)
        : newTopics.add(topicId);
      return { ...prev, topics: newTopics };
    });
  };

  const toggleLesson = (lessonId: number) => {
    setExpanded((prev) => {
      const newLessons = new Set(prev.lessons);
      newLessons.has(lessonId)
        ? newLessons.delete(lessonId)
        : newLessons.add(lessonId);
      return { ...prev, lessons: newLessons };
    });
  };

  const toggleSection = (sectionId: number) => {
    setExpanded((prev) => {
      const newSections = new Set(prev.sections);
      newSections.has(sectionId)
        ? newSections.delete(sectionId)
        : newSections.add(sectionId);
      return { ...prev, sections: newSections };
    });
  };

  const toggleQuestion = (questionId: number) => {
    setExpanded((prev) => {
      const newQuestions = new Set(prev.questions);
      newQuestions.has(questionId)
        ? newQuestions.delete(questionId)
        : newQuestions.add(questionId);
      return { ...prev, questions: newQuestions };
    });
  };

  const handleDeleteQuestion = (questionId: number) => {
    // Update local state
    setQuestions((prev) => {
      const newQuestions = { ...prev };
      Object.keys(newQuestions).forEach((sectionId) => {
        newQuestions[Number(sectionId)] = newQuestions[Number(sectionId)].map(
          (q) => (q.id === questionId ? { ...q, is_deleted: true } : q)
        );
      });
      return newQuestions;
    });

    toast.success("Question deleted successfully");
  };

  const handleRestoreQuestion = (questionId: number) => {
    // Update local state
    setQuestions((prev) => {
      const newQuestions = { ...prev };
      Object.keys(newQuestions).forEach((sectionId) => {
        newQuestions[Number(sectionId)] = newQuestions[Number(sectionId)].map(
          (q) => (q.id === questionId ? { ...q, is_deleted: false } : q)
        );
      });
      return newQuestions;
    });

    toast.success("Question restored successfully");
  };

  const getLessonTypeColor = (type: LessonType) => {
    const colors: Record<LessonType, string> = {
      READING: "bg-blue-500/20 text-blue-600",
      LISTENING: "bg-pink-500/20 text-pink-600",
      SPEAKING: "bg-indigo-500/20 text-indigo-600",
      WRITING: "bg-purple-500/20 text-purple-600",
      VOCABULARY: "bg-green-500/20 text-green-600",
      GRAMMAR: "bg-orange-500/20 text-orange-600",
      TEST: "bg-red-500/20 text-red-600",
    };
    return colors[type];
  };

  const getStatusVariant = (
    status: LessonStatus
  ): "draft" | "pending" | "published" | "archived" | "rejected" => {
    return status.toLowerCase() as any;
  };

  const getQuestionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MULTIPLE_CHOICE: "bg-blue-500/20 text-blue-600",
      MULTIPLE_SELECT: "bg-green-500/20 text-green-600",
      FILL_IN_THE_BLANK: "bg-purple-500/20 text-purple-600",
      MATCHING: "bg-orange-500/20 text-orange-600",
      TRANSCRIPT: "bg-pink-500/20 text-pink-600",
      ARRANGE_WORDS: "bg-indigo-500/20 text-indigo-600",
    };
    return colors[type] || "bg-gray-500/20 text-gray-600";
  };

  const renderQuestionDetails = (
    question: Question & { is_deleted?: boolean }
  ) => {
    if (!expanded.questions.has(question.id)) return null;

    return (
      <div className="ml-6 mt-2 p-4 bg-card border-l-2 border-muted rounded-lg space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
            Content
          </p>
          <div className="p-3 bg-muted/50 rounded-md border border-border">
            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
              {JSON.stringify(question.content, null, 2)}
            </pre>
          </div>
        </div>

        {question.audio_url && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
              Audio URL
            </p>
            <div className="p-2 bg-muted/50 rounded-md border border-border">
              <p className="text-xs text-blue-600 break-all">
                {question.audio_url}
              </p>
            </div>
          </div>
        )}

        {question.explanation && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
              Explanation
            </p>
            <div className="p-2 bg-muted/50 rounded-md border border-border">
              <p className="text-xs text-foreground">{question.explanation}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Library className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Content Library
          </h2>
        </div>
        <p className="text-muted-foreground">
          Browse and manage all learning content organized in a hierarchical
          structure
        </p>
      </div>

      <div className="space-y-3 max-w-6xl">
        {topics.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Library className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No topics found</p>
          </div>
        ) : (
          topics.map((topic) => (
            <ContentTreeItem
              key={topic.id}
              title={topic.name}
              createdAt={topic.created_at}
              icon={Folder}
              iconColor="bg-blue-500/10 text-blue-600"
              description={topic.description}
              isExpanded={expanded.topics.has(topic.id)}
              onClick={() => toggleTopic(topic.id)}
              level={0}
            >
              {lessons[topic.id]?.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 pl-6">
                  No lessons in this topic
                </p>
              ) : (
                lessons[topic.id]?.map((lesson) => (
                  <ContentTreeItem
                    key={lesson.id}
                    title={lesson.title}
                    createdAt={lesson.created_at}
                    icon={BookOpen}
                    iconColor="bg-green-500/10 text-green-600"
                    description={lesson.description}
                    badges={
                      <BadgeGroup>
                        <TypeBadge
                          type={lesson.type}
                          color={getLessonTypeColor(lesson.type)}
                        />
                        <StatusBadge
                          status={lesson.status}
                          variant={getStatusVariant(lesson.status)}
                        />
                      </BadgeGroup>
                    }
                    isExpanded={expanded.lessons.has(lesson.id)}
                    onClick={() => toggleLesson(lesson.id)}
                    level={1}
                  >
                    {sections[lesson.id]?.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2 pl-6">
                        No sections in this lesson
                      </p>
                    ) : (
                      sections[lesson.id]?.map((section) => (
                        <ContentTreeItem
                          key={section.id}
                          title={section.title}
                          createdAt={section.created_at}
                          icon={FileText}
                          iconColor="bg-purple-500/10 text-purple-600"
                          isExpanded={expanded.sections.has(section.id)}
                          onClick={() => toggleSection(section.id)}
                          level={2}
                        >
                          {questions[section.id]?.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2 pl-6">
                              No questions in this section
                            </p>
                          ) : (
                            questions[section.id]?.map((question) => (
                              <div key={question.id}>
                                <ContentTreeItem
                                  title={`Question #${question.id}`}
                                  createdAt={question.created_at}
                                  icon={HelpCircle}
                                  iconColor="bg-amber-500/10 text-amber-600"
                                  badges={
                                    <BadgeGroup>
                                      <TypeBadge
                                        type={question.type}
                                        color={getQuestionTypeColor(
                                          question.type
                                        )}
                                      />
                                      {question.is_deleted && (
                                        <StatusBadge
                                          status="DELETED"
                                          variant="deleted"
                                        />
                                      )}
                                    </BadgeGroup>
                                  }
                                  isExpanded={expanded.questions.has(
                                    question.id
                                  )}
                                  onClick={() => toggleQuestion(question.id)}
                                  level={3}
                                  actions={
                                    <>
                                      {question.is_deleted ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRestoreQuestion(question.id);
                                          }}
                                          className="p-1.5 hover:bg-green-500/10 rounded-md transition-colors"
                                          title="Restore"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5 text-green-600" />
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteQuestion(question.id);
                                          }}
                                          className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                        </button>
                                      )}
                                    </>
                                  }
                                />
                                {renderQuestionDetails(question)}
                              </div>
                            ))
                          )}
                        </ContentTreeItem>
                      ))
                    )}
                  </ContentTreeItem>
                ))
              )}
            </ContentTreeItem>
          ))
        )}
      </div>
    </div>
  );
}
