import {
  List,
  Plus,
  Trash2,
  Edit,
  BookOpen,
  Folder,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  contentService,
  LessonSectionCreateRequest,
  LessonSectionUpdateRequest,
} from "@/services/contentService";
import { Lesson, LessonSection } from "@/types/content";
import { toast } from "sonner";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  Breadcrumb,
  ContentCard,
  ActionMenu,
  Modal,
  ConfirmModal,
} from "@/components/shared";

export default function LessonSections() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSection, setSelectedSection] = useState<LessonSection | null>(
    null
  );
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const [createFormData, setCreateFormData] =
    useState<LessonSectionCreateRequest>({
      lesson_id: parseInt(lessonId || "0"),
      title: "",
      order_index: 0,
    });

  const [editFormData, setEditFormData] = useState<LessonSectionUpdateRequest>({
    title: "",
    order_index: 0,
  });

  useEffect(() => {
    if (lessonId) {
      fetchLessonAndSections();
    }
  }, [lessonId]);

  const fetchLessonAndSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const [lessonResponse, sectionsResponse] = await Promise.all([
        contentService.getLessonById(parseInt(lessonId!), {
          include_deleted: true,
        }),
        contentService.getSectionsByLesson(parseInt(lessonId!), {
          include_deleted: true,
        }),
      ]);
      setLesson(lessonResponse.data);
      const sortedSections = sectionsResponse.data.sort(
        (a, b) => a.order_index - b.order_index
      );
      setSections(sortedSections);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Không thể tải dữ liệu"
      );
      console.error("Error fetching lesson and sections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section: LessonSection) => {
    if (!section.is_deleted) {
      navigate(`/moderator/sections/${section.id}/questions`);
    }
  };

  const handleEditClick = (section: LessonSection) => {
    setSelectedSection(section);
    setEditFormData({
      title: section.title,
      order_index: section.order_index,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (section: LessonSection) => {
    setSelectedSection(section);
    setShowDeleteConfirm(true);
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.title.trim()) return;

    try {
      setCreating(true);
      await contentService.createSection({
        ...createFormData,
        lesson_id: parseInt(lessonId!),
        title: createFormData.title.trim(),
      });

      setCreateFormData({
        lesson_id: parseInt(lessonId || "0"),
        title: "",
        order_index: 0,
      });
      setShowCreateModal(false);
      toast.success("Tạo section thành công!");
      await fetchLessonAndSections();
    } catch (err: any) {
      console.error("Error creating section:", err);
      toast.error(err.response?.data?.detail || "Không thể tạo section");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection || !selectedSection.id || !editFormData.title?.trim())
      return;

    try {
      setUpdating(true);
      await contentService.updateSection(selectedSection.id, {
        ...editFormData,
        title: editFormData.title?.trim(),
      });

      setShowEditModal(false);
      setSelectedSection(null);
      setEditFormData({ title: "", order_index: 0 });
      toast.success("Cập nhật section thành công!");
      await fetchLessonAndSections();
    } catch (err: any) {
      console.error("Error updating section:", err);
      toast.error(err.response?.data?.detail || "Không thể cập nhật section");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!selectedSection || !selectedSection.id) return;

    try {
      setDeleting(true);
      await contentService.deleteSection(selectedSection.id);

      setShowDeleteConfirm(false);
      setSelectedSection(null);
      toast.success("Xóa section thành công!");
      await fetchLessonAndSections();
    } catch (err: any) {
      console.error("Error deleting section:", err);
      toast.error(err.response?.data?.detail || "Không thể xóa section");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-8">
      <Breadcrumb
        items={[
          {
            label: "Nội dung",
            href: "/moderator",
            icon: <Folder className="w-4 h-4" />,
          },
          {
            label: lesson?.topic_id ? `Topic ${lesson.topic_id}` : "Lessons",
            href: `/moderator/topics/${lesson?.topic_id}/lessons`,
            icon: <BookOpen className="w-4 h-4" />,
          },
          { label: lesson?.title || "Sections" },
        ]}
      />

      <PageHeader
        icon={<FileText className="w-6 h-6 text-primary" />}
        title={
          loading ? "Đang tải..." : lesson?.title || "Các phần của bài học"
        }
        subtitle={lesson?.description || "Quản lý các phần trong bài học này"}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            <Plus className="w-5 h-5" />
            Tạo Section mới
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Đang tải sections..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLessonAndSections} />
      ) : sections.length === 0 ? (
        <EmptyState
          icon={<List className="w-full h-full" />}
          title="Chưa có section nào"
          description="Bắt đầu bằng cách tạo section đầu tiên"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              Tạo Section đầu tiên
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <ContentCard
              key={section.id}
              type="section"
              icon={
                section.is_deleted ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <div className="w-6 h-6 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                )
              }
              title={section.title}
              badge={section.is_deleted ? "Đã xóa" : undefined}
              meta={[
                { label: "Thứ tự", value: section.order_index },
                { label: "Ngày tạo", value: formatDate(section.created_at) },
              ]}
              onClick={() => handleSectionClick(section)}
              actions={
                !section.is_deleted &&
                section.id && (
                  <ActionMenu
                    items={[
                      {
                        icon: <Edit className="w-4 h-4" />,
                        label: "Chỉnh sửa",
                        onClick: () => handleEditClick(section),
                      },
                      {
                        icon: <Trash2 className="w-4 h-4" />,
                        label: "Xóa",
                        onClick: () => handleDeleteClick(section),
                        variant: "danger",
                      },
                    ]}
                  />
                )
              }
            />
          ))}
        </div>
      )}

      {/* Create Section Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo Section mới"
      >
        <form onSubmit={handleCreateSection} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tiêu đề Section <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createFormData.title}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  title: e.target.value,
                })
              }
              placeholder="VD: Giới thiệu"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              value={createFormData.order_index}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  order_index: parseInt(e.target.value) || 0,
                })
              }
              min={0}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Số nhỏ hơn sẽ hiển thị trước
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold"
              disabled={creating}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={creating || !createFormData.title.trim()}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Đang tạo..." : "Tạo Section"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Section Modal */}
      <Modal
        isOpen={showEditModal && !!selectedSection}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSection(null);
        }}
        title="Chỉnh sửa Section"
      >
        <form onSubmit={handleUpdateSection} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tiêu đề Section <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
              placeholder="VD: Giới thiệu"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              value={editFormData.order_index}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  order_index: parseInt(e.target.value) || 0,
                })
              }
              min={0}
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Số nhỏ hơn sẽ hiển thị trước
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedSection(null);
              }}
              className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold"
              disabled={updating}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updating || !editFormData.title?.trim()}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm && !!selectedSection}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedSection(null);
        }}
        onConfirm={handleDeleteSection}
        title="Xác nhận xóa"
        message={
          <>
            Bạn có chắc chắn muốn xóa section{" "}
            <strong className="text-foreground">
              "{selectedSection?.title}"
            </strong>
            ? Hành động này không thể hoàn tác và sẽ xóa tất cả các câu hỏi liên
            quan.
          </>
        }
        confirmText={deleting ? "Đang xóa..." : "Xóa Section"}
        confirmDisabled={deleting}
        variant="danger"
      />
    </div>
  );
}
