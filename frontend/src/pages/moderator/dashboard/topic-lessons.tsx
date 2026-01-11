import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Edit,
  Folder,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  contentService,
  LessonCreateRequest,
  LessonUpdateRequest,
} from "@/services/contentService";
import { Lesson, Topic, LessonType, LessonStatus } from "@/types/content";
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

export default function TopicLessons() {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [deletedLessons, setDeletedLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const navigate = useNavigate();

  const [createFormData, setCreateFormData] = useState<LessonCreateRequest>({
    topic_id: parseInt(topicId || "0"),
    type: LessonType.READING,
    title: "",
    description: "",
    status: LessonStatus.DRAFT,
    order_index: 0,
  });

  const [editFormData, setEditFormData] = useState<LessonUpdateRequest>({
    type: LessonType.READING,
    title: "",
    description: "",
    status: LessonStatus.DRAFT,
    order_index: 0,
  });

  useEffect(() => {
    if (topicId) {
      fetchTopicAndLessons();
    }
  }, [topicId]);

  const fetchTopicAndLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const [topicResponse, lessonsResponse] = await Promise.all([
        contentService.getTopicById(parseInt(topicId!)),
        contentService.getLessonsByTopic(parseInt(topicId!), {
          include_deleted: true,
        }),
      ]);
      setTopic(topicResponse.data);

      // Separate active and deleted lessons
      const allLessons = lessonsResponse.data;
      const activeLessons = allLessons
        .filter((l) => !l.is_deleted)
        .sort((a, b) => a.order_index - b.order_index);
      const deleted = allLessons
        .filter((l) => l.is_deleted)
        .sort((a, b) => a.order_index - b.order_index);

      setLessons(activeLessons);
      setDeletedLessons(deleted);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Không thể tải dữ liệu"
      );
      console.error("Error fetching topic and lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (!lesson.is_deleted) {
      navigate(`/moderator/lessons/${lesson.id}/sections`);
    }
  };

  const handleEditClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setEditFormData({
      type: lesson.type,
      title: lesson.title,
      description: lesson.description || "",
      status: lesson.status,
      order_index: lesson.order_index,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowDeleteConfirm(true);
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.title.trim()) return;

    try {
      setCreating(true);
      await contentService.createLesson({
        ...createFormData,
        topic_id: parseInt(topicId!),
        title: createFormData.title.trim(),
        description: createFormData.description?.trim() || undefined,
      });

      setCreateFormData({
        topic_id: parseInt(topicId || "0"),
        type: LessonType.READING,
        title: "",
        description: "",
        status: LessonStatus.DRAFT,
        order_index: 0,
      });
      setShowCreateModal(false);
      toast.success("Tạo bài học thành công!");
      await fetchTopicAndLessons();
    } catch (err: any) {
      console.error("Error creating lesson:", err);
      toast.error(err.response?.data?.detail || "Không thể tạo bài học");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson || !editFormData.title?.trim()) return;

    try {
      setUpdating(true);
      await contentService.updateLesson(selectedLesson.id, {
        ...editFormData,
        title: editFormData.title?.trim(),
        description: editFormData.description?.trim() || undefined,
      });

      setShowEditModal(false);
      setSelectedLesson(null);
      setEditFormData({
        type: LessonType.READING,
        title: "",
        description: "",
        status: LessonStatus.DRAFT,
        order_index: 0,
      });
      toast.success("Cập nhật bài học thành công!");
      await fetchTopicAndLessons();
    } catch (err: any) {
      console.error("Error updating lesson:", err);
      toast.error(err.response?.data?.detail || "Không thể cập nhật bài học");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;

    try {
      setDeleting(true);
      await contentService.deleteLesson(selectedLesson.id);

      setShowDeleteConfirm(false);
      setSelectedLesson(null);
      toast.success("Xóa bài học thành công!");
      await fetchTopicAndLessons();
    } catch (err: any) {
      console.error("Error deleting lesson:", err);
      toast.error(err.response?.data?.detail || "Không thể xóa bài học");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestoreLesson = async (lesson: Lesson) => {
    try {
      setRestoring(true);
      await contentService.restoreLesson(lesson.id);
      toast.success("Khôi phục bài học thành công!");
      await fetchTopicAndLessons();
    } catch (err: any) {
      console.error("Error restoring lesson:", err);
      toast.error(err.response?.data?.detail || "Không thể khôi phục bài học");
    } finally {
      setRestoring(false);
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
          { label: topic?.name || "Bài học" },
        ]}
      />

      <PageHeader
        icon={<BookOpen className="w-6 h-6 text-primary" />}
        title={
          loading
            ? "Đang tải..."
            : showRecycleBin
            ? "Thùng rác - Bài học"
            : topic?.name || "Bài học của Topic"
        }
        subtitle={
          showRecycleBin
            ? "Các bài học đã xóa có thể khôi phục"
            : topic?.description || "Quản lý các bài học trong topic này"
        }
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRecycleBin(!showRecycleBin)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                showRecycleBin
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Trash2 className="w-5 h-5" />
              Thùng rác ({deletedLessons.length})
            </button>
            {!showRecycleBin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
              >
                <Plus className="w-5 h-5" />
                Tạo bài học mới
              </button>
            )}
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Đang tải bài học..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTopicAndLessons} />
      ) : showRecycleBin ? (
        // Recycle Bin View
        deletedLessons.length === 0 ? (
          <EmptyState
            icon={<Trash2 className="w-full h-full" />}
            title="Thùng rác trống"
            description="Không có bài học nào đã xóa"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {deletedLessons.map((lesson) => (
              <ContentCard
                key={lesson.id}
                type="lesson"
                icon={<Trash2 className="w-6 h-6" />}
                title={lesson.title}
                subtitle={lesson.description}
                badge={lesson.type}
                status={lesson.status as any}
                meta={[
                  { label: "Thứ tự", value: lesson.order_index },
                  { label: "Ngày tạo", value: formatDate(lesson.created_at) },
                ]}
                actions={
                  <button
                    onClick={() => handleRestoreLesson(lesson)}
                    disabled={restoring}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Khôi phục
                  </button>
                }
              />
            ))}
          </div>
        )
      ) : lessons.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-full h-full" />}
          title="Chưa có bài học nào"
          description="Bắt đầu bằng cách tạo bài học đầu tiên"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              Tạo bài học đầu tiên
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lessons.map((lesson) => (
            <ContentCard
              key={lesson.id}
              type="lesson"
              icon={<BookOpen className="w-6 h-6" />}
              title={lesson.title}
              subtitle={lesson.description}
              badge={lesson.type}
              status={lesson.status as any}
              meta={[
                { label: "Thứ tự", value: lesson.order_index },
                { label: "Ngày tạo", value: formatDate(lesson.created_at) },
              ]}
              onClick={() => handleLessonClick(lesson)}
              actions={
                <ActionMenu
                  items={[
                    {
                      icon: <Edit className="w-4 h-4" />,
                      label: "Chỉnh sửa",
                      onClick: () => handleEditClick(lesson),
                    },
                    {
                      icon: <Trash2 className="w-4 h-4" />,
                      label: "Xóa",
                      onClick: () => handleDeleteClick(lesson),
                      variant: "danger",
                    },
                  ]}
                />
              }
            />
          ))}
        </div>
      )}

      {/* Create Lesson Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo bài học mới"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateLesson} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tiêu đề bài học <span className="text-red-500">*</span>
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
              placeholder="VD: Giới thiệu về thì quá khứ"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Loại bài học <span className="text-red-500">*</span>
            </label>
            <select
              value={createFormData.type}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  type: e.target.value as LessonType,
                })
              }
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
            >
              {Object.values(LessonType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Mô tả
            </label>
            <textarea
              value={createFormData.description}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  description: e.target.value,
                })
              }
              placeholder="Mô tả ngắn gọn về bài học này..."
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              rows={4}
              maxLength={1000}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Trạng thái
            </label>
            <select
              value={createFormData.status}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  status: e.target.value as LessonStatus,
                })
              }
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              {Object.values(LessonStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
              {creating ? "Đang tạo..." : "Tạo bài học"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        isOpen={showEditModal && !!selectedLesson}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLesson(null);
        }}
        title="Chỉnh sửa bài học"
        maxWidth="2xl"
      >
        <form onSubmit={handleUpdateLesson} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tiêu đề bài học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
              placeholder="VD: Giới thiệu về thì quá khứ"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Loại bài học <span className="text-red-500">*</span>
            </label>
            <select
              value={editFormData.type}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  type: e.target.value as LessonType,
                })
              }
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
            >
              {Object.values(LessonType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Mô tả
            </label>
            <textarea
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
              placeholder="Mô tả ngắn gọn về bài học này..."
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              rows={4}
              maxLength={1000}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Trạng thái
            </label>
            <select
              value={editFormData.status}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  status: e.target.value as LessonStatus,
                })
              }
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              {Object.values(LessonStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedLesson(null);
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
        isOpen={showDeleteConfirm && !!selectedLesson}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedLesson(null);
        }}
        onConfirm={handleDeleteLesson}
        title="Xác nhận xóa"
        message={
          <>
            Bạn có chắc chắn muốn xóa bài học{" "}
            <strong className="text-foreground">
              "{selectedLesson?.title}"
            </strong>
            ? Hành động này không thể hoàn tác và sẽ xóa tất cả các phần liên
            quan.
          </>
        }
        confirmText={deleting ? "Đang xóa..." : "Xóa bài học"}
        confirmDisabled={deleting}
        variant="danger"
      />
    </div>
  );
}
