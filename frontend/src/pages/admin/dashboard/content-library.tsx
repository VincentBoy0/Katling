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
  Question,
  QuestionType,
} from "@/types/content";
import { ContentTreeItem } from "@/components/admin/content/ContentTreeItem";
import {
  StatusBadge,
  TypeBadge,
  BadgeGroup,
} from "@/components/admin/content/Badges";
import { toast } from "sonner";
import { useContentAdministraion } from "@/hooks/useContentAdministration";
import {
  PageHeader,
  Tabs,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/shared/PageComponents";

interface ExpandedState {
  topics: Set<number>;
  lessons: Set<number>;
  sections: Set<number>;
  questions: Set<number>;
}

type TabType = "library" | "recycling-bin";

// Color mappings
const LESSON_TYPE_COLORS: Record<LessonType, string> = {
  READING: "bg-blue-500/20 text-blue-600",
  LISTENING: "bg-pink-500/20 text-pink-600",
  SPEAKING: "bg-indigo-500/20 text-indigo-600",
  WRITING: "bg-purple-500/20 text-purple-600",
  VOCABULARY: "bg-green-500/20 text-green-600",
  GRAMMAR: "bg-orange-500/20 text-orange-600",
  TEST: "bg-red-500/20 text-red-600",
};

const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  MCQ: "bg-blue-500/20 text-blue-600",
  MULTIPLE_SELECT: "bg-green-500/20 text-green-600",
  FILL_IN_THE_BLANK: "bg-purple-500/20 text-purple-600",
  MATCHING: "bg-orange-500/20 text-orange-600",
  TRANSCRIPT: "bg-pink-500/20 text-pink-600",
  TRUE_FALSE: "bg-teal-500/20 text-teal-600",
  ORDERING: "bg-indigo-500/20 text-indigo-600",
  PRONUNCIATION: "bg-violet-500/20 text-violet-600",
};

export default function ContentLibrary() {
  const [activeTab, setActiveTab] = useState<TabType>("library");
  const {
    loading,
    error,
    topics,
    lessons,
    sections,
    questions,
    getLessonsByTopic,
    getSectionsByLesson,
    getQuestionsBySection,
    deleteQuestion,
    restoreQuestion,
  } = useContentAdministraion();

  const [expanded, setExpanded] = useState<ExpandedState>({
    topics: new Set(),
    lessons: new Set(),
    sections: new Set(),
    questions: new Set(),
  });

  // Toggle handlers
  const createToggleHandler = (
    key: keyof ExpandedState,
    onExpand?: (id: number) => void
  ) => {
    return (id: number) => {
      setExpanded((prev) => {
        const newSet = new Set(prev[key] as Set<number>);
        const isExpanding = !newSet.has(id);

        isExpanding ? newSet.add(id) : newSet.delete(id);

        if (isExpanding && onExpand) {
          onExpand(id);
        }

        return { ...prev, [key]: newSet };
      });
    };
  };

  const toggleTopic = createToggleHandler("topics", getLessonsByTopic);
  const toggleLesson = createToggleHandler("lessons", getSectionsByLesson);
  const toggleSection = createToggleHandler("sections", getQuestionsBySection);
  const toggleQuestion = createToggleHandler("questions");

  // Action handlers
  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteQuestion(questionId);
      toast.success("Question deleted successfully");
    } catch (err) {
      toast.error("Failed to delete question");
    }
  };

  const handleRestoreQuestion = async (questionId: number) => {
    try {
      await restoreQuestion(questionId);
      toast.success("Question restored successfully");
    } catch (err) {
      toast.error("Failed to restore question");
    }
  };

  // Filter helpers
  const filterQuestions = (
    questionList: (Question & { is_deleted?: boolean })[]
  ) => {
    return questionList.filter((q) =>
      activeTab === "library" ? !q.is_deleted : q.is_deleted
    );
  };

  // Render helpers
  const renderQuestionAction = (
    question: Question & { is_deleted?: boolean }
  ) => {
    const isRecycleBin = activeTab === "recycling-bin";
    const handleClick = isRecycleBin
      ? handleRestoreQuestion
      : handleDeleteQuestion;
    const Icon = isRecycleBin ? RotateCcw : Trash2;
    const colorClass = isRecycleBin ? "green" : "red";

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClick(question.id!);
        }}
        className={`p-1.5 hover:bg-${colorClass}-500/10 rounded-md transition-colors`}
        title={isRecycleBin ? "Restore" : "Delete"}
      >
        <Icon className={`w-3.5 h-3.5 text-${colorClass}-600`} />
      </button>
    );
  };

  const renderQuestionDetails = (question: Question) => {
    if (!question.id || !expanded.questions.has(question.id)) return null;

    const detailFields = [
      {
        label: "Type",
        content: (
          <TypeBadge
            type={question.type}
            color={
              QUESTION_TYPE_COLORS[question.type] ||
              "bg-gray-500/20 text-gray-600"
            }
          />
        ),
      },
      {
        label: "Content",
        content: (
          <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
            {JSON.stringify(question.content, null, 2)}
          </pre>
        ),
      },
      question.correct_answer && {
        label: "Correct Answer",
        content: (
          <pre className="text-xs text-green-700 dark:text-green-400 whitespace-pre-wrap font-mono">
            {JSON.stringify(question.correct_answer, null, 2)}
          </pre>
        ),
        containerClass: "bg-green-500/5 border-green-500/20",
      },
      question.audio_url && {
        label: "Audio URL",
        content: (
          <a
            href={question.audio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 break-all underline"
          >
            {question.audio_url}
          </a>
        ),
      },
      question.explanation && {
        label: "Explanation",
        content: (
          <p className="text-xs text-foreground">{question.explanation}</p>
        ),
      },
    ].filter(Boolean);

    return (
      <div className="ml-6 mt-2 p-4 bg-card border-l-2 border-muted rounded-lg space-y-3">
        {detailFields.map((field: any, idx) => (
          <div key={idx}>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
              {field.label}
            </p>
            <div
              className={`p-3 ${
                field.containerClass || "bg-muted/50 border-border"
              } rounded-md border`}
            >
              {field.content}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQuestion = (question: Question & { is_deleted?: boolean }) => (
    <div key={question.id}>
      <ContentTreeItem
        title={`Question #${question.id || "N/A"}`}
        createdAt={question.created_at}
        icon={HelpCircle}
        iconColor="bg-amber-500/10 text-amber-600"
        badges={
          <BadgeGroup>
            <TypeBadge
              type={question.type}
              color={
                QUESTION_TYPE_COLORS[question.type] ||
                "bg-gray-500/20 text-gray-600"
              }
            />
            {question.is_deleted && (
              <StatusBadge status="DELETED" variant="deleted" />
            )}
          </BadgeGroup>
        }
        isExpanded={expanded.questions.has(question.id!)}
        onClick={() => toggleQuestion(question.id!)}
        level={3}
        actions={renderQuestionAction(question)}
      />
      {renderQuestionDetails(question)}
    </div>
  );

  const renderSection = (section: LessonSection) => {
    if (!section.id) return null;

    const sectionQuestions = questions[section.id] || [];
    const filteredQuestions = filterQuestions(sectionQuestions);

    return (
      <ContentTreeItem
        key={section.id}
        title={section.title}
        createdAt={section.created_at}
        icon={FileText}
        iconColor="bg-purple-500/10 text-purple-600"
        isExpanded={expanded.sections.has(section.id)}
        onClick={() => toggleSection(section.id!)}
        level={2}
      >
        {filteredQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 pl-6">
            No questions in this section
          </p>
        ) : (
          filteredQuestions.map(renderQuestion)
        )}
      </ContentTreeItem>
    );
  };

  const renderLesson = (lesson: Lesson) => (
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
            color={LESSON_TYPE_COLORS[lesson.type]}
          />
          <StatusBadge
            status={lesson.status}
            variant={lesson.status.toLowerCase() as any}
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
        sections[lesson.id]?.map(renderSection)
      )}
    </ContentTreeItem>
  );

  const renderTopic = (topic: Topic) => (
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
        lessons[topic.id]?.map(renderLesson)
      )}
    </ContentTreeItem>
  );

  return (
    <div className="p-8">
      <PageHeader
        icon={<Library className="w-6 h-6 text-primary" />}
        title="Content Library"
        subtitle="Browse and manage all learning content"
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "library", label: "Library" },
          {
            id: "recycling-bin",
            label: "Recycling Bin",
            icon: <Trash2 className="w-4 h-4" />,
          },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabType)}
      />

      {loading && topics.length === 0 ? (
        <LoadingState message="Loading topics..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="space-y-3 max-w-6xl">
          {topics.length === 0 ? (
            <EmptyState
              icon={<Library className="w-full h-full" />}
              title="No topics found"
            />
          ) : (
            topics.map(renderTopic)
          )}
        </div>
      )}
    </div>
  );
}
