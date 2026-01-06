import { BookOpen, Plus, Trash2, ArrowLeft, FileText, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contentService, LessonCreateRequest } from "@/services/contentService";
import { Lesson, Topic, LessonType, LessonStatus } from "@/types/content";

export default function TopicLessons() {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LessonCreateRequest>({
    topic_id: parseInt(topicId || "0"),
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
        contentService.getLessonsByTopic(parseInt(topicId!), { include_deleted: true }),
      ]);
      setTopic(topicResponse.data);
      const sortedLessons = lessonsResponse.data.sort((a, b) => a.order_index - b.order_index);
      setLessons(sortedLessons);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch data");
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

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setCreating(true);
      await contentService.createLesson({
        ...formData,
        topic_id: parseInt(topicId!),
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
      });

      setFormData({
        topic_id: parseInt(topicId || "0"),
        type: LessonType.READING,
        title: "",
        description: "",
        status: LessonStatus.DRAFT,
        order_index: 0,
      });
      setShowCreateModal(false);
      await fetchTopicAndLessons();
    } catch (err: any) {
      console.error("Error creating lesson:", err);
      alert(err.response?.data?.detail || "Failed to create lesson");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLessonTypeColor = (type: LessonType) => {
    const colors = {
      [LessonType.READING]: "bg-blue-500/10 text-blue-600",
      [LessonType.LISTENING]: "bg-purple-500/10 text-purple-600",
      [LessonType.SPEAKING]: "bg-green-500/10 text-green-600",
      [LessonType.WRITING]: "bg-yellow-500/10 text-yellow-600",
      [LessonType.VOCABULARY]: "bg-pink-500/10 text-pink-600",
      [LessonType.GRAMMAR]: "bg-indigo-500/10 text-indigo-600",
      [LessonType.TEST]: "bg-red-500/10 text-red-600",
    };
    return colors[type] || "bg-gray-500/10 text-gray-600";
  };

  const getStatusColor = (status: LessonStatus) => {
    const colors = {
      [LessonStatus.DRAFT]: "bg-gray-500/10 text-gray-600",
      [LessonStatus.PENDING]: "bg-yellow-500/10 text-yellow-600",
      [LessonStatus.PUBLISHED]: "bg-green-500/10 text-green-600",
      [LessonStatus.ARCHIVED]: "bg-orange-500/10 text-orange-600",
      [LessonStatus.REJECTED]: "bg-red-500/10 text-red-600",
    };
    return colors[status] || "bg-gray-500/10 text-gray-600";
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Topics
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {loading ? "Loading..." : topic?.name || "Topic Lessons"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {topic?.description || "Manage lessons for this topic"}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create New Lesson
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading lessons...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={fetchTopicAndLessons}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : lessons.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            No lessons created yet
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            Create Your First Lesson
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => handleLessonClick(lesson)}
              className={`
                bg-card border rounded-xl p-6 transition-all
                ${
                  lesson.is_deleted
                    ? "border-red-500/30 bg-red-500/5 opacity-60 cursor-not-allowed"
                    : "border-border hover:shadow-lg hover:border-primary/50 cursor-pointer"
                }
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-foreground">
                      {lesson.title}
                    </h3>
                    {lesson.is_deleted && (
                      <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                        Deleted
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getLessonTypeColor(lesson.type)}`}>
                      {lesson.type}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(lesson.status)}`}>
                      {lesson.status}
                    </span>
                  </div>
                </div>
                {!lesson.is_deleted && (
                  <Edit className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {lesson.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                <span>Order: {lesson.order_index}</span>
                <span>{formatDate(lesson.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Create New Lesson</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to Past Tense"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  required
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Lesson Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as LessonType })}
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this lesson..."
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  rows={4}
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as LessonStatus })}
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
                  Order Index
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.title.trim()}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
