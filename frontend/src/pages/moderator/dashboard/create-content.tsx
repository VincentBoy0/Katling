import { BookOpen, Plus, Trash2, Edit, Folder } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  contentService,
  TopicCreateRequest,
  TopicUpdateRequest,
} from "@/services/contentService";
import { Topic } from "@/types/content";
import { toast } from "sonner";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/shared/PageComponents";
import { ContentCard, ActionMenu } from "@/components/shared/ContentComponents";
import { Modal, ConfirmModal } from "@/components/shared/Modal";

export default function CreateContent() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Form state for create
  const [createFormData, setCreateFormData] = useState<TopicCreateRequest>({
    name: "",
    description: "",
    order_index: 0,
  });

  // Form state for edit
  const [editFormData, setEditFormData] = useState<TopicUpdateRequest>({
    name: "",
    description: "",
    order_index: 0,
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentService.getAllTopics();
      const sortedTopics = response.data.sort(
        (a, b) => a.order_index - b.order_index
      );
      setTopics(sortedTopics);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch topics"
      );
      console.error("Error fetching topics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    if (!topic.is_deleted) {
      navigate(`/moderator/topics/${topic.id}/lessons`);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createFormData.name.trim()) {
      toast.error("Tên topic không được để trống");
      return;
    }

    try {
      setCreating(true);
      await contentService.createTopic({
        name: createFormData.name.trim(),
        description: createFormData.description?.trim() || undefined,
        order_index: createFormData.order_index,
      });

      setCreateFormData({ name: "", description: "", order_index: 0 });
      setShowCreateModal(false);
      toast.success("Tạo topic thành công!");
      await fetchTopics();
    } catch (err: any) {
      console.error("Error creating topic:", err);
      toast.error(err.response?.data?.detail || "Không thể tạo topic");
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setEditFormData({
      name: topic.name,
      description: topic.description || "",
      order_index: topic.order_index,
    });
    setShowEditModal(true);
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTopic || !editFormData.name?.trim()) {
      toast.error("Tên topic không được để trống");
      return;
    }

    try {
      setUpdating(true);
      await contentService.updateTopic(selectedTopic.id, {
        name: editFormData.name.trim(),
        description: editFormData.description?.trim() || undefined,
        order_index: editFormData.order_index,
      });

      setShowEditModal(false);
      setSelectedTopic(null);
      toast.success("Cập nhật topic thành công!");
      await fetchTopics();
    } catch (err: any) {
      console.error("Error updating topic:", err);
      toast.error(err.response?.data?.detail || "Không thể cập nhật topic");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowDeleteConfirm(true);
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopic) return;

    try {
      setDeleting(true);
      await contentService.deleteTopic(selectedTopic.id);

      setShowDeleteConfirm(false);
      setSelectedTopic(null);
      toast.success("Xóa topic thành công!");
      await fetchTopics();
    } catch (err: any) {
      console.error("Error deleting topic:", err);
      toast.error(err.response?.data?.detail || "Không thể xóa topic");
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
      <PageHeader
        icon={<Folder className="w-6 h-6 text-primary" />}
        title="Quản lý Nội dung"
        subtitle="Quản lý các chủ đề học tập và bài học"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            <Plus className="w-5 h-5" />
            Tạo Topic mới
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Đang tải topics..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTopics} />
      ) : topics.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-full h-full" />}
          title="Chưa có topic nào"
          description="Bắt đầu bằng cách tạo topic đầu tiên"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              Tạo Topic đầu tiên
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <ContentCard
              key={topic.id}
              type="topic"
              icon={
                topic.is_deleted ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <Folder className="w-6 h-6" />
                )
              }
              title={topic.name}
              subtitle={topic.description}
              badge={topic.is_deleted ? "Đã xóa" : undefined}
              meta={[
                { label: "Thứ tự", value: topic.order_index },
                { label: "Ngày tạo", value: formatDate(topic.created_at) },
              ]}
              onClick={() => handleTopicClick(topic)}
              actions={
                !topic.is_deleted && (
                  <ActionMenu
                    items={[
                      {
                        icon: <Edit className="w-4 h-4" />,
                        label: "Chỉnh sửa",
                        onClick: () => handleEditClick(topic),
                      },
                      {
                        icon: <Trash2 className="w-4 h-4" />,
                        label: "Xóa",
                        onClick: () => handleDeleteClick(topic),
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

      {/* Create Topic Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateFormData({ name: "", description: "", order_index: 0 });
        }}
        title="Tạo Topic mới"
      >
        <form onSubmit={handleCreateTopic} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tên Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createFormData.name}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  name: e.target.value,
                })
              }
              placeholder="VD: Ngữ pháp cơ bản"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
              maxLength={255}
            />
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
              placeholder="Mô tả ngắn gọn về topic này..."
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {createFormData.description?.length || 0}/1000 ký tự
            </p>
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
              onClick={() => {
                setShowCreateModal(false);
                setCreateFormData({
                  name: "",
                  description: "",
                  order_index: 0,
                });
              }}
              className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold"
              disabled={creating}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={creating || !createFormData.name.trim()}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Đang tạo..." : "Tạo Topic"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Topic Modal */}
      <Modal
        isOpen={showEditModal && !!selectedTopic}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTopic(null);
          setEditFormData({ name: "", description: "", order_index: 0 });
        }}
        title="Chỉnh sửa Topic"
      >
        <form onSubmit={handleUpdateTopic} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tên Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              placeholder="VD: Ngữ pháp cơ bản"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              required
              maxLength={255}
            />
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
              placeholder="Mô tả ngắn gọn về topic này..."
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {editFormData.description?.length || 0}/1000 ký tự
            </p>
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
                setSelectedTopic(null);
                setEditFormData({
                  name: "",
                  description: "",
                  order_index: 0,
                });
              }}
              className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold"
              disabled={updating}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updating || !editFormData.name?.trim()}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm && !!selectedTopic}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedTopic(null);
        }}
        onConfirm={handleDeleteTopic}
        title="Xác nhận xóa"
        message={
          <>
            Bạn có chắc chắn muốn xóa topic{" "}
            <strong className="text-foreground">"{selectedTopic?.name}"</strong>
            ? Hành động này không thể hoàn tác và sẽ xóa tất cả các bài học liên
            quan.
          </>
        }
        confirmText={deleting ? "Đang xóa..." : "Xóa Topic"}
        confirmDisabled={deleting}
        variant="danger"
      />
    </div>
  );
}
