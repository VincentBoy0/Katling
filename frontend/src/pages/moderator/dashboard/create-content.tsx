import { BookOpen, Plus, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contentService, TopicCreateRequest } from "@/services/contentService";
import { Topic } from "@/types/content";

export default function CreateContent() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<TopicCreateRequest>({
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
      // Sort topics by order_index
      const sortedTopics = response.data.sort((a, b) => a.order_index - b.order_index);
      setTopics(sortedTopics);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch topics");
      console.error("Error fetching topics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    // Only navigate if topic is not deleted
    if (!topic.is_deleted) {
      navigate(`/moderator/topics/${topic.id}/lessons`);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      setCreating(true);
      await contentService.createTopic({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        order_index: formData.order_index,
      });
      
      // Reset form and close modal
      setFormData({ name: "", description: "", order_index: 0 });
      setShowCreateModal(false);
      
      // Refresh topics list
      await fetchTopics();
    } catch (err: any) {
      console.error("Error creating topic:", err);
      alert(err.response?.data?.detail || "Failed to create topic");
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

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Learning Topics</h2>
          <p className="text-muted-foreground mt-2">
            Manage learning topics and their sections
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create New Topic
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading topics...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={fetchTopics}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : topics.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            No topics created yet
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            Create Your First Topic
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => handleTopicClick(topic)}
              className={`
                bg-card border rounded-xl p-6 transition-all
                ${
                  topic.is_deleted
                    ? "border-red-500/30 bg-red-500/5 opacity-60 cursor-not-allowed"
                    : "border-border hover:shadow-lg hover:border-primary/50 cursor-pointer"
                }
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    p-3 rounded-lg
                    ${
                      topic.is_deleted
                        ? "bg-red-500/10"
                        : "bg-primary/10"
                    }
                  `}
                  >
                    {topic.is_deleted ? (
                      <Trash2 className="w-6 h-6 text-red-500" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      {topic.name}
                    </h3>
                    {topic.is_deleted && (
                      <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                        Deleted
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {topic.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {topic.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                <span>Order: {topic.order_index}</span>
                <span>{formatDate(topic.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Create New Topic</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ name: "", description: "", order_index: 0 });
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Topic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basic Grammar"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this topic..."
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description?.length || 0}/1000 characters
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Controls the display order (lower numbers appear first)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: "", description: "", order_index: 0 });
                  }}
                  className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.name.trim()}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
