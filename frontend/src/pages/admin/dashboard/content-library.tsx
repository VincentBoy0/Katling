import { useState } from "react";
import {
  Library,
  Folder,
  BookOpen,
  FileText,
  HelpCircle,
  Trash2,
  RotateCcw,
  ChevronDown,
  Check,
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

const STATUS_OPTIONS: { value: LessonStatus; label: string; color: string }[] =
  [
    {
      value: "DRAFT" as LessonStatus,
      label: "Draft",
      color: "text-yellow-600 bg-yellow-500/10",
    },
    {
      value: "PUBLISHED" as LessonStatus,
      label: "Published",
      color: "text-green-600 bg-green-500/10",
    },
    {
      value: "ARCHIVED" as LessonStatus,
      label: "Archived",
      color: "text-gray-600 bg-gray-500/10",
    },
  ];

// StatusDropdown component
interface StatusDropdownProps {
  currentStatus: LessonStatus;
  itemId: number;
  itemType: "topic" | "lesson" | "section" | "question";
  isOpen: boolean;
  onToggle: () => void;
  onStatusChange: (id: number, status: LessonStatus) => Promise<void>;
}

const StatusDropdown = ({
  currentStatus,
  itemId,
  itemType,
  isOpen,
  onToggle,
  onStatusChange,
}: StatusDropdownProps) => {
  const currentOption = STATUS_OPTIONS.find(
    (opt) => opt.value === currentStatus
  );

  const handleStatusChange = async (status: LessonStatus) => {
    try {
      await onStatusChange(itemId, status);
      toast.success(
        `${
          itemType.charAt(0).toUpperCase() + itemType.slice(1)
        } status updated to ${status}`
      );
    } catch (err) {
      toast.error(`Failed to update ${itemType} status`);
    }
  };

  return (
    <div className="relative">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
          currentOption?.color || "bg-gray-500/10 text-gray-600"
        } hover:opacity-80`}
      >
        {currentOption?.label || currentStatus}
        <ChevronDown className="w-3 h-3" />
      </div>
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 min-w-32 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {STATUS_OPTIONS.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                handleStatusChange(option.value);
                onToggle();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-muted transition-colors cursor-pointer ${option.color}`}
            >
              {option.label}
              {currentStatus === option.value && <Check className="w-3 h-3" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper to get question preview text
const getQuestionPreview = (question: Question): string => {
  const content = question.content || {};
  if (question.type === QuestionType.MATCHING) {
    return content.left && content.left.length > 0
      ? `Match: ${content.left.join(", ")}`
      : "Matching question";
  }
  if (question.type === QuestionType.ORDERING) {
    return content.words && content.words.length > 0
      ? `Order: ${content.words.join(", ")}`
      : "Ordering question";
  }
  return (
    content.question ||
    content.text ||
    content.instruction ||
    content.sentence ||
    "(No content)"
  );
};

export default function ContentLibrary() {
  const [activeTab, setActiveTab] = useState<TabType>("library");
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
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
    updateTopicStatus,
    updateLessonStatus,
    updateSectionStatus,
    updateQuestionStatus,
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

    const content = question.content || {};
    const correctAnswer = question.correct_answer || {};

    // Build detail fields based on question type
    const detailFields: any[] = [];

    // Common fields
    if (
      content.question ||
      content.text ||
      content.instruction ||
      content.sentence
    ) {
      detailFields.push({
        label: "Question",
        content: (
          <p className="text-sm text-foreground">
            {content.question ||
              content.text ||
              content.instruction ||
              content.sentence}
          </p>
        ),
      });
    }

    // Type-specific content display
    switch (question.type) {
      case QuestionType.MCQ:
      case QuestionType.MULTIPLE_SELECT:
        if (content.options && Array.isArray(content.options)) {
          // Backend uses: answer (MCQ) or answers (MULTIPLE_SELECT)
          const correctAnswerValue =
            correctAnswer.answer || correctAnswer.answers;
          const isMultipleSelect = Array.isArray(correctAnswerValue);

          detailFields.push({
            label: "Options",
            content: (
              <ul className="space-y-1">
                {content.options.map((opt: string, idx: number) => (
                  <li
                    key={idx}
                    className={`text-sm px-2 py-1 rounded ${
                      (
                        isMultipleSelect
                          ? correctAnswerValue.includes(opt)
                          : correctAnswerValue === opt
                      )
                        ? "bg-green-500/10 text-green-700 dark:text-green-400 font-medium"
                        : "text-foreground"
                    }`}
                  >
                    {idx + 1}. {opt}
                    {(isMultipleSelect
                      ? correctAnswerValue.includes(opt)
                      : correctAnswerValue === opt) && " ✓"}
                  </li>
                ))}
              </ul>
            ),
          });
        }
        // Show correct answer explicitly
        if (correctAnswer.answer && !Array.isArray(correctAnswer.answer)) {
          detailFields.push({
            label: "Correct Answer",
            content: (
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                {correctAnswer.answer}
              </p>
            ),
            containerClass: "bg-green-500/5 border-green-500/20",
          });
        } else if (
          correctAnswer.answers &&
          Array.isArray(correctAnswer.answers)
        ) {
          detailFields.push({
            label: "Correct Answers",
            content: (
              <ul className="space-y-1">
                {correctAnswer.answers.map((opt: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-sm text-green-700 dark:text-green-400 font-medium"
                  >
                    • {opt}
                  </li>
                ))}
              </ul>
            ),
            containerClass: "bg-green-500/5 border-green-500/20",
          });
        }
        break;

      case QuestionType.MATCHING:
        if (content.left && content.right) {
          detailFields.push({
            label: "Matching Items",
            content: (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Left Column
                  </p>
                  <ul className="space-y-1">
                    {content.left.map((item: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm text-foreground px-2 py-1 bg-blue-500/10 rounded"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Right Column
                  </p>
                  <ul className="space-y-1">
                    {content.right.map((item: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm text-foreground px-2 py-1 bg-purple-500/10 rounded"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ),
          });
        }
        // Backend uses: matches (object with key-value pairs)
        if (
          correctAnswer.matches &&
          typeof correctAnswer.matches === "object"
        ) {
          const matchPairs = Object.entries(correctAnswer.matches);
          detailFields.push({
            label: "Correct Matches",
            content: (
              <ul className="space-y-1">
                {matchPairs.map(([left, right]: [string, any], idx: number) => (
                  <li
                    key={idx}
                    className="text-sm text-green-700 dark:text-green-400 px-2 py-1 bg-green-500/10 rounded font-medium"
                  >
                    {left} ↔ {right}
                  </li>
                ))}
              </ul>
            ),
            containerClass: "bg-green-500/5 border-green-500/20",
          });
        }
        break;

      case QuestionType.ORDERING:
        if (content.words && Array.isArray(content.words)) {
          detailFields.push({
            label: "Words to Order",
            content: (
              <div className="flex flex-wrap gap-2">
                {content.words.map((word: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-sm px-2 py-1 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded"
                  >
                    {word}
                  </span>
                ))}
              </div>
            ),
          });
        }
        // Backend uses: arranged_words (snake_case)
        if (
          correctAnswer.arranged_words &&
          Array.isArray(correctAnswer.arranged_words)
        ) {
          detailFields.push({
            label: "Correct Order",
            content: (
              <div className="space-y-1">
                <div className="flex flex-wrap gap-2">
                  {correctAnswer.arranged_words.map(
                    (word: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-sm px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded font-medium"
                      >
                        {idx + 1}. {word}
                      </span>
                    )
                  )}
                </div>
                <p className="text-sm text-green-700 dark:text-green-400 mt-2 font-medium">
                  "{correctAnswer.arranged_words.join(" ")}"
                </p>
              </div>
            ),
            containerClass: "bg-green-500/5 border-green-500/20",
          });
        }
        break;

      case QuestionType.FILL_IN_THE_BLANK:
        if (correctAnswer.answer) {
          detailFields.push({
            label: "Correct Answer",
            content: (
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                {correctAnswer.answer}
              </p>
            ),
            containerClass: "bg-green-500/5 border-green-500/20",
          });
        }
        break;

      case QuestionType.TRUE_FALSE:
        // Backend uses: answer (boolean)
        if (correctAnswer.answer !== undefined) {
          detailFields.push({
            label: "Correct Answer",
            content: (
              <p
                className={`text-sm font-medium ${
                  correctAnswer.answer ? "text-green-600" : "text-red-600"
                }`}
              >
                {correctAnswer.answer ? "True" : "False"}
              </p>
            ),
            containerClass: "bg-green-500/5 border-green-500/20",
          });
        }
        break;

      case QuestionType.TRANSCRIPT:
      case QuestionType.PRONUNCIATION:
        if (correctAnswer.transcript) {
          detailFields.push({
            label: "Correct Transcript",
            content: (
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                {correctAnswer.transcript}
              </p>
            ),
            containerClass: "bg-green-500/5 border-green-500/20",
          });
        }
        break;

      default:
        // Fallback to JSON display for unknown types
        detailFields.push({
          label: "Content",
          content: (
            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
              {JSON.stringify(content, null, 2)}
            </pre>
          ),
        });
        if (question.correct_answer) {
          detailFields.push({
            label: "Correct Answer",
            content: (
              <pre className="text-xs text-green-700 dark:text-green-400 whitespace-pre-wrap font-mono">
                {JSON.stringify(question.correct_answer, null, 2)}
              </pre>
            ),
            containerClass: "bg-green-500/5 border-green-500/20",
          });
        }
    }

    // Audio URL
    if (question.audio_url) {
      detailFields.push({
        label: "Audio",
        content: (
          <div className="flex items-center gap-2">
            <audio controls className="h-8">
              <source src={question.audio_url} />
            </audio>
            <a
              href={question.audio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Open
            </a>
          </div>
        ),
      });
    }

    // Explanation
    if (question.explanation) {
      detailFields.push({
        label: "Explanation",
        content: (
          <p className="text-sm text-foreground">{question.explanation}</p>
        ),
      });
    }

    return (
      <div className="ml-12 mt-2 p-4 bg-card border-l-2 border-muted rounded-lg space-y-3">
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

  const renderQuestion = (
    question: Question & { is_deleted?: boolean; status?: LessonStatus }
  ) => {
    const dropdownKey = `question-${question.id}`;
    const questionPreview = getQuestionPreview(question);

    return (
      <div key={question.id}>
        <ContentTreeItem
          title={
            questionPreview.length > 60
              ? questionPreview.slice(0, 60) + "..."
              : questionPreview
          }
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
          actions={
            <div className="flex items-center gap-2">
              {question.status && (
                <StatusDropdown
                  currentStatus={question.status}
                  itemId={question.id!}
                  itemType="question"
                  isOpen={statusDropdown === dropdownKey}
                  onToggle={() =>
                    setStatusDropdown(
                      statusDropdown === dropdownKey ? null : dropdownKey
                    )
                  }
                  onStatusChange={updateQuestionStatus}
                />
              )}
              {renderQuestionAction(question)}
            </div>
          }
        />
        {renderQuestionDetails(question)}
      </div>
    );
  };

  const renderSection = (section: LessonSection) => {
    if (!section.id) return null;

    const sectionQuestions = questions[section.id] || [];
    const filteredQuestions = filterQuestions(sectionQuestions);
    const dropdownKey = `section-${section.id}`;

    return (
      <ContentTreeItem
        key={section.id}
        title={section.title}
        createdAt={section.created_at}
        icon={FileText}
        iconColor="bg-purple-500/10 text-purple-600"
        badges={
          section.status && (
            <StatusBadge
              status={section.status}
              variant={section.status.toLowerCase() as any}
            />
          )
        }
        isExpanded={expanded.sections.has(section.id)}
        onClick={() => toggleSection(section.id!)}
        level={2}
        actions={
          section.status && (
            <StatusDropdown
              currentStatus={section.status}
              itemId={section.id}
              itemType="section"
              isOpen={statusDropdown === dropdownKey}
              onToggle={() =>
                setStatusDropdown(
                  statusDropdown === dropdownKey ? null : dropdownKey
                )
              }
              onStatusChange={updateSectionStatus}
            />
          )
        }
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

  const renderLesson = (lesson: Lesson) => {
    const dropdownKey = `lesson-${lesson.id}`;

    return (
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
        actions={
          <StatusDropdown
            currentStatus={lesson.status}
            itemId={lesson.id}
            itemType="lesson"
            isOpen={statusDropdown === dropdownKey}
            onToggle={() =>
              setStatusDropdown(
                statusDropdown === dropdownKey ? null : dropdownKey
              )
            }
            onStatusChange={updateLessonStatus}
          />
        }
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
  };

  const renderTopic = (topic: Topic) => {
    const dropdownKey = `topic-${topic.id}`;

    return (
      <ContentTreeItem
        key={topic.id}
        title={topic.name}
        createdAt={topic.created_at}
        icon={Folder}
        iconColor="bg-blue-500/10 text-blue-600"
        description={topic.description}
        badges={
          topic.status && (
            <StatusBadge
              status={topic.status}
              variant={topic.status.toLowerCase() as any}
            />
          )
        }
        isExpanded={expanded.topics.has(topic.id)}
        onClick={() => toggleTopic(topic.id)}
        level={0}
        actions={
          topic.status && (
            <StatusDropdown
              currentStatus={topic.status}
              itemId={topic.id}
              itemType="topic"
              isOpen={statusDropdown === dropdownKey}
              onToggle={() =>
                setStatusDropdown(
                  statusDropdown === dropdownKey ? null : dropdownKey
                )
              }
              onStatusChange={updateTopicStatus}
            />
          )
        }
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
  };

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
