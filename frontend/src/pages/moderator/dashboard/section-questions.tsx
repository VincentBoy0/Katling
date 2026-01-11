import {
  HelpCircle,
  Plus,
  ArrowLeft,
  BookOpen,
  Folder,
  FileText,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contentService } from "@/services/contentService";
import { LessonSection, Question, Lesson, Topic } from "@/types/content";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/shared";
import {
  QuestionCard,
  QuestionModal,
  DeleteConfirmModal,
  QuestionFormData,
  getInitialFormData,
  buildQuestionData,
  parseQuestionToFormData,
} from "@/components/moderator/questions";

export default function SectionQuestions() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();

  // Data state
  const [section, setSection] = useState<LessonSection | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [deletedQuestions, setDeletedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Selected question for edit/delete
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  // Loading states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // UI state
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Form data
  const [createFormData, setCreateFormData] = useState<QuestionFormData>(
    getInitialFormData()
  );
  const [editFormData, setEditFormData] = useState<QuestionFormData>(
    getInitialFormData()
  );

  useEffect(() => {
    if (sectionId) {
      fetchSectionAndQuestions();
    }
  }, [sectionId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest(".dropdown-container")) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeDropdown]);

  const fetchSectionAndQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sectionResponse, questionsResponse] = await Promise.all([
        contentService.getSectionById(parseInt(sectionId!)),
        contentService.getQuestionsBySection(parseInt(sectionId!)),
      ]);
      setSection(sectionResponse.data);

      // Fetch lesson data
      if (sectionResponse.data.lesson_id) {
        const lessonResponse = await contentService.getLessonById(
          sectionResponse.data.lesson_id
        );
        setLesson(lessonResponse.data);

        // Fetch topic data
        if (lessonResponse.data.topic_id) {
          const topicResponse = await contentService.getTopicById(
            lessonResponse.data.topic_id
          );
          setTopic(topicResponse.data);
        }
      }

      // Separate active and deleted questions
      const allQuestions = questionsResponse.data;
      const activeQuestions = allQuestions
        .filter((q) => !q.is_deleted)
        .sort((a, b) => a.order_index - b.order_index);
      const deleted = allQuestions
        .filter((q) => q.is_deleted)
        .sort((a, b) => a.order_index - b.order_index);

      setQuestions(activeQuestions);
      setDeletedQuestions(deleted);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Không thể tải dữ liệu"
      );
      console.error("Error fetching section and questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (e: React.MouseEvent, questionId: number) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === questionId ? null : questionId);
  };

  const handleEditClick = (e: React.MouseEvent, question: Question) => {
    e.stopPropagation();
    setSelectedQuestion(question);
    setEditFormData(parseQuestionToFormData(question));
    setActiveDropdown(null);
    setShowEditModal(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, question: Question) => {
    e.stopPropagation();
    setSelectedQuestion(question);
    setActiveDropdown(null);
    setShowDeleteConfirm(true);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);
      const { content, correct_answer } = buildQuestionData(createFormData);

      // Auto calculate order_index
      const nextOrderIndex =
        questions.length > 0
          ? Math.max(...questions.map((q) => q.order_index)) + 1
          : 0;

      await contentService.createQuestion({
        section_id: parseInt(sectionId!),
        type: createFormData.type,
        content,
        correct_answer,
        explanation: createFormData.explanation?.trim() || undefined,
        audio_url: createFormData.audio_url?.trim() || undefined,
        order_index: nextOrderIndex,
      });

      setCreateFormData(getInitialFormData());
      setShowCreateModal(false);
      toast.success("Tạo câu hỏi thành công!");
      await fetchSectionAndQuestions();
    } catch (err: any) {
      console.error("Error creating question:", err);
      toast.error(err.response?.data?.detail || "Không thể tạo câu hỏi");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !selectedQuestion.id) return;

    try {
      setUpdating(true);
      const { content, correct_answer } = buildQuestionData(editFormData);

      await contentService.updateQuestion(selectedQuestion.id, {
        type: editFormData.type,
        content,
        correct_answer,
        explanation: editFormData.explanation?.trim() || undefined,
        audio_url: editFormData.audio_url?.trim() || undefined,
        order_index: selectedQuestion.order_index, // Keep original order
      });

      setShowEditModal(false);
      setSelectedQuestion(null);
      toast.success("Cập nhật câu hỏi thành công!");
      await fetchSectionAndQuestions();
    } catch (err: any) {
      console.error("Error updating question:", err);
      toast.error(err.response?.data?.detail || "Không thể cập nhật câu hỏi");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion || !selectedQuestion.id) return;

    try {
      setDeleting(true);
      await contentService.deleteQuestion(selectedQuestion.id);

      setShowDeleteConfirm(false);
      setSelectedQuestion(null);
      toast.success("Đã chuyển câu hỏi vào thùng rác!");
      await fetchSectionAndQuestions();
    } catch (err: any) {
      console.error("Error deleting question:", err);
      toast.error(err.response?.data?.detail || "Không thể xóa câu hỏi");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestoreQuestion = async (question: Question) => {
    if (!question.id) return;

    try {
      setRestoring(true);
      await contentService.restoreQuestion(question.id);
      toast.success("Khôi phục câu hỏi thành công!");
      await fetchSectionAndQuestions();
    } catch (err: any) {
      console.error("Error restoring question:", err);
      toast.error(err.response?.data?.detail || "Không thể khôi phục câu hỏi");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            label: "Topics",
            href: "/moderator/topics",
            icon: <Folder className="w-4 h-4" />,
          },
          {
            label: topic?.name || "Topic",
            href: topic?.id
              ? `/moderator/topics/${topic.id}/lessons`
              : undefined,
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            label: lesson?.title || "Lesson",
            href: lesson?.id
              ? `/moderator/lessons/${lesson.id}/sections`
              : undefined,
            icon: <FileText className="w-4 h-4" />,
          },
          { label: section?.title || "Questions" },
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {loading
                ? "Đang tải..."
                : section?.title || "Câu hỏi của Section"}
            </h2>
            <p className="text-muted-foreground mt-2">
              Quản lý các câu hỏi trong section này
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRecycleBin(!showRecycleBin)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                showRecycleBin
                  ? "bg-red-500/10 text-red-500 border border-red-500/20"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Thùng rác{" "}
              {deletedQuestions.length > 0 && `(${deletedQuestions.length})`}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              <Plus className="w-5 h-5" />
              Tạo câu hỏi mới
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchSectionAndQuestions} />
      ) : showRecycleBin ? (
        // Recycle Bin View
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-600 font-medium">
              Các câu hỏi đã xóa ({deletedQuestions.length})
            </span>
          </div>
          {deletedQuestions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Trash2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Thùng rác trống</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {deletedQuestions.map((question) => (
                <div
                  key={question.id}
                  className="bg-card border border-red-500/20 rounded-xl p-4 opacity-75"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-semibold">
                          {question.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          #{question.order_index + 1}
                        </span>
                      </div>
                      <p className="text-foreground font-medium line-clamp-2">
                        {question.content?.question ||
                          question.content?.text ||
                          question.content?.instruction ||
                          question.content?.sentence ||
                          "(Không có nội dung)"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreQuestion(question)}
                      disabled={restoring}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors font-medium disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Khôi phục
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreateModal(true)} />
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              isDropdownOpen={activeDropdown === question.id}
              onToggleDropdown={(e) => toggleDropdown(e, question.id!)}
              onEdit={(e) => handleEditClick(e, question)}
              onDelete={(e) => handleDeleteClick(e, question)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <QuestionModal
        isOpen={showCreateModal}
        title="Tạo câu hỏi mới"
        formData={createFormData}
        setFormData={setCreateFormData}
        onClose={() => {
          setShowCreateModal(false);
          setCreateFormData(getInitialFormData());
        }}
        onSubmit={handleCreateQuestion}
        isSubmitting={creating}
        submitLabel="Tạo câu hỏi"
      />

      {/* Edit Modal */}
      <QuestionModal
        isOpen={showEditModal}
        title="Chỉnh sửa câu hỏi"
        formData={editFormData}
        setFormData={setEditFormData}
        onClose={() => {
          setShowEditModal(false);
          setSelectedQuestion(null);
        }}
        onSubmit={handleUpdateQuestion}
        isSubmitting={updating}
        submitLabel="Cập nhật"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa"
        message="Câu hỏi sẽ được chuyển vào thùng rác. Bạn có thể khôi phục lại sau."
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedQuestion(null);
        }}
        onConfirm={handleDeleteQuestion}
        isDeleting={deleting}
      />
    </div>
  );
}

// Sub-components for cleaner code
function LoadingState() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-muted-foreground mt-4">Đang tải câu hỏi...</p>
      </div>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
      <p className="text-red-600 font-medium">Lỗi: {error}</p>
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg mb-4">Chưa có câu hỏi nào</p>
      <button
        onClick={onCreateClick}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
      >
        Tạo câu hỏi đầu tiên
      </button>
    </div>
  );
}
