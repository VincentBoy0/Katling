import { HelpCircle, Plus, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contentService } from "@/services/contentService";
import { LessonSection, Question } from "@/types/content";
import { toast } from "sonner";
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        contentService.getSectionById(parseInt(sectionId!), {
          include_deleted: true,
        }),
        contentService.getQuestionsBySection(parseInt(sectionId!)),
      ]);
      setSection(sectionResponse.data);
      const sortedQuestions = questionsResponse.data.sort(
        (a, b) => a.order_index - b.order_index
      );
      setQuestions(sortedQuestions);
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

      await contentService.createQuestion({
        section_id: parseInt(sectionId!),
        type: createFormData.type,
        content,
        correct_answer,
        explanation: createFormData.explanation?.trim() || undefined,
        audio_url: createFormData.audio_url?.trim() || undefined,
        order_index: createFormData.order_index,
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
        order_index: editFormData.order_index,
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
      toast.success("Xóa câu hỏi thành công!");
      await fetchSectionAndQuestions();
    } catch (err: any) {
      console.error("Error deleting question:", err);
      toast.error(err.response?.data?.detail || "Không thể xóa câu hỏi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Sections
        </button>

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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            <Plus className="w-5 h-5" />
            Tạo câu hỏi mới
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchSectionAndQuestions} />
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
        message="Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác."
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
