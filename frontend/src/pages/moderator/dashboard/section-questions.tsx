import { HelpCircle, Plus, Trash2, ArrowLeft, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { contentService, QuestionCreateRequest } from "@/services/contentService";
import { LessonSection, Question, QuestionType } from "@/types/content";

export default function SectionQuestions() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [section, setSection] = useState<LessonSection | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<QuestionCreateRequest>({
    section_id: parseInt(sectionId || "0"),
    type: QuestionType.MCQ,
    explanation: "",
    order_index: 0,
  });

  useEffect(() => {
    if (sectionId) {
      fetchSectionAndQuestions();
    }
  }, [sectionId]);

  const fetchSectionAndQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sectionResponse, questionsResponse] = await Promise.all([
        contentService.getSectionById(parseInt(sectionId!), { include_deleted: true }),
        contentService.getQuestionsBySection(parseInt(sectionId!)),
      ]);
      setSection(sectionResponse.data);
      const sortedQuestions = questionsResponse.data.sort((a, b) => a.order_index - b.order_index);
      setQuestions(sortedQuestions);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch data");
      console.error("Error fetching section and questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);
      await contentService.createQuestion({
        ...formData,
        section_id: parseInt(sectionId!),
        explanation: formData.explanation?.trim() || undefined,
      });

      setFormData({
        section_id: parseInt(sectionId || "0"),
        type: QuestionType.MCQ,
        explanation: "",
        order_index: 0,
      });
      setShowCreateModal(false);
      await fetchSectionAndQuestions();
    } catch (err: any) {
      console.error("Error creating question:", err);
      alert(err.response?.data?.detail || "Failed to create question");
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

  const getQuestionTypeColor = (type: QuestionType) => {
    const colors = {
      [QuestionType.MCQ]: "bg-blue-500/10 text-blue-600",
      [QuestionType.MULTIPLE_SELECT]: "bg-purple-500/10 text-purple-600",
      [QuestionType.TRUE_FALSE]: "bg-green-500/10 text-green-600",
      [QuestionType.FILL_IN_THE_BLANK]: "bg-yellow-500/10 text-yellow-600",
      [QuestionType.MATCHING]: "bg-pink-500/10 text-pink-600",
      [QuestionType.ORDERING]: "bg-indigo-500/10 text-indigo-600",
      [QuestionType.PRONUNCIATION]: "bg-orange-500/10 text-orange-600",
      [QuestionType.TRANSCRIPT]: "bg-teal-500/10 text-teal-600",
    };
    return colors[type] || "bg-gray-500/10 text-gray-600";
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sections
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {loading ? "Loading..." : section?.title || "Section Questions"}
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage questions for this section
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create New Question
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading questions...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={fetchSectionAndQuestions}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            No questions created yet
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            Create Your First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`
                bg-card border rounded-xl p-6 transition-all
                ${
                  question.is_deleted
                    ? "border-red-500/30 bg-red-500/5 opacity-60"
                    : "border-border hover:shadow-lg hover:border-primary/50"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-lg font-bold flex-shrink-0
                    ${question.is_deleted ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getQuestionTypeColor(question.type)}`}>
                        {question.type}
                      </span>
                      {question.is_deleted && (
                        <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                          Deleted
                        </span>
                      )}
                    </div>
                    {question.explanation && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {question.explanation}
                      </p>
                    )}
                    {question.audio_url && (
                      <p className="text-xs text-muted-foreground">
                        🔊 Audio attached
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>Order: {question.order_index}</span>
                      <span>{formatDate(question.created_at)}</span>
                    </div>
                  </div>
                </div>
                {!question.is_deleted && (
                  <Edit className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Create New Question</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Question Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  required
                >
                  {Object.values(QuestionType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Explanation
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explanation or additional context for this question..."
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Audio URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.audio_url || ""}
                  onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  maxLength={512}
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

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-600">
                  <strong>Note:</strong> After creating the question, you'll need to edit it to add the actual question content and correct answer.
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
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
