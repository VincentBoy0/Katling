import { List, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contentService, LessonSectionCreateRequest } from "@/services/contentService";
import { Lesson, LessonSection } from "@/types/content";

export default function LessonSections() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LessonSectionCreateRequest>({
    lesson_id: parseInt(lessonId || "0"),
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
        contentService.getLessonById(parseInt(lessonId!), { include_deleted: true }),
        contentService.getSectionsByLesson(parseInt(lessonId!), { include_deleted: true }),
      ]);
      setLesson(lessonResponse.data);
      const sortedSections = sectionsResponse.data.sort((a, b) => a.order_index - b.order_index);
      setSections(sortedSections);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch data");
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

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setCreating(true);
      await contentService.createSection({
        ...formData,
        lesson_id: parseInt(lessonId!),
        title: formData.title.trim(),
      });

      setFormData({
        lesson_id: parseInt(lessonId || "0"),
        title: "",
        order_index: 0,
      });
      setShowCreateModal(false);
      await fetchLessonAndSections();
    } catch (err: any) {
      console.error("Error creating section:", err);
      alert(err.response?.data?.detail || "Failed to create section");
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
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {loading ? "Loading..." : lesson?.title || "Lesson Sections"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {lesson?.description || "Manage sections for this lesson"}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create New Section
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading sections...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={fetchLessonAndSections}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <List className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            No sections created yet
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            Create Your First Section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              onClick={() => handleSectionClick(section)}
              className={`
                bg-card border rounded-xl p-6 transition-all
                ${
                  section.is_deleted
                    ? "border-red-500/30 bg-red-500/5 opacity-60 cursor-not-allowed"
                    : "border-border hover:shadow-lg hover:border-primary/50 cursor-pointer"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-lg font-bold
                    ${section.is_deleted ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">
                        {section.title}
                      </h3>
                      {section.is_deleted && (
                        <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                          Deleted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Order: {section.order_index}</span>
                      <span>{formatDate(section.created_at)}</span>
                    </div>
                  </div>
                </div>
                {!section.is_deleted && (
                  <Edit className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Create New Section</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Section Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  required
                  maxLength={150}
                />
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
                  {creating ? "Creating..." : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
