import CategoryForm from "@/components/moderator/CategoryForm";
import { contentTypeDefinitions, type ContentType } from "@/lib/content-types";
import { Check, Edit2, Eye, Trash2, Upload } from "lucide-react";
import { useState } from "react";

const sessionCategories = Object.entries(contentTypeDefinitions).map(
  ([id, config]) => ({
    id: id as ContentType,
    label: config.name,
    color: config.color,
    icon: config.icon,
  })
);

export default function UploadSession() {
  const [uploadedSessions, setUploadedSessions] = useState([
    {
      id: 1,
      title: "Past Tense Basics",
      category: "grammar",
      difficulty: "Beginner",
      uploadedAt: "2024-11-09",
      status: "Published",
      data: {},
    },
    {
      id: 2,
      title: "Pronunciation: R vs L",
      category: "pronunciation",
      difficulty: "Intermediate",
      uploadedAt: "2024-11-08",
      status: "Published",
      data: {},
    },
    {
      id: 3,
      title: "Business Vocabulary",
      category: "vocabulary",
      difficulty: "Intermediate",
      uploadedAt: "2024-11-07",
      status: "Pending Review",
      data: {},
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ContentType | null>(
    null
  );
  const [difficulty, setDifficulty] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const handleCategorySubmit = (categoryData: Record<string, any>) => {
    const newSession = {
      id: Math.max(...uploadedSessions.map((s) => s.id), 0) + 1,
      title:
        categoryData.lessonTitle ||
        categoryData.title ||
        categoryData.word ||
        categoryData.soundTitle ||
        categoryData.topic ||
        "Untitled",
      category: selectedCategory,
      difficulty,
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "Pending Review",
      data: categoryData,
    };

    setUploadedSessions((prev) => [newSession, ...prev]);
    setConfirmingId(newSession.id);

    setTimeout(() => {
      setConfirmingId(null);
      setShowForm(false);
      setSelectedCategory(null);
      setDifficulty("");
    }, 1500);
  };

  const handleDeleteSession = (id: number) => {
    setUploadedSessions((prev) => prev.filter((s) => s.id !== id));
    setConfirmingId(id);
    setTimeout(() => setConfirmingId(null), 1500);
  };

  const getCategoryColor = (categoryId: string) => {
    return sessionCategories.find((cat) => cat.id === categoryId)?.color || "";
  };

  const getCategoryLabel = (categoryId: string) => {
    return (
      sessionCategories.find((cat) => cat.id === categoryId)?.label ||
      categoryId
    );
  };

  const viewingSession = viewingId
    ? uploadedSessions.find((s) => s.id === viewingId)
    : null;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Upload Learning Sessions
          </h2>
          <p className="text-muted-foreground mt-2">
            Create and manage learning content for different categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
        >
          <Upload className="w-5 h-5" />
          New Session
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-8 mb-8">
          {!selectedCategory ? (
            <>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Select Content Type
              </h3>
              <p className="text-muted-foreground mb-8">
                Choose the type of content you want to create
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {sessionCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="p-6 rounded-lg border-2 transition-all text-left hover:shadow-lg bg-card hover:bg-muted/50"
                  >
                    <div className="text-3xl mb-3">
                      {cat.icon === "BookOpen" && "📚"}
                      {cat.icon === "BookMarked" && "📖"}
                      {cat.icon === "Mic" && "🎤"}
                      {cat.icon === "Headphones" && "🎧"}
                      {cat.icon === "MessageSquare" && "💬"}
                    </div>
                    <h4 className="font-bold text-foreground">{cat.label}</h4>
                    <p className="text-xs text-muted-foreground mt-2">
                      Create {cat.label.toLowerCase()} content
                    </p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Create {contentTypeDefinitions[selectedCategory].name}{" "}
                    Content
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Fill in all required fields marked with *
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                >
                  ← Change Type
                </button>
              </div>

              <div className="mb-8 max-w-xs">
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Difficulty Level *
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select difficulty level</option>
                  {["Beginner", "Intermediate", "Advanced", "Expert"].map(
                    (level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="bg-muted/30 rounded-lg p-6 border border-border">
                <CategoryForm
                  category={selectedCategory}
                  onSubmit={handleCategorySubmit}
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground">
            Your Sessions ({uploadedSessions.length})
          </h3>
        </div>

        {uploadedSessions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              No sessions uploaded yet. Create your first content!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Difficulty
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {uploadedSessions.map((session) => (
                  <tr
                    key={session.id}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      confirmingId === session.id ? "bg-green-500/10" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {session.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                          session.category
                        )}`}
                      >
                        {getCategoryLabel(session.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {session.difficulty}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {session.uploadedAt}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          session.status === "Published"
                            ? "bg-green-500/20 text-green-600"
                            : "bg-yellow-500/20 text-yellow-600"
                        }`}
                      >
                        {confirmingId === session.id && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingId(session.id)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(session.id)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                          title="Edit session"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-muted/50 border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {viewingSession.title}
              </h2>
              <button
                onClick={() => setViewingId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="font-semibold text-foreground">
                    {getCategoryLabel(viewingSession.category)}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Difficulty
                  </p>
                  <p className="font-semibold text-foreground">
                    {viewingSession.difficulty}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold text-foreground">
                    {viewingSession.status}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Content Details
                </h3>
                <div className="space-y-4 text-sm">
                  {Object.entries(viewingSession.data || {}).map(
                    ([key, value]) => {
                      if (Array.isArray(value)) {
                        return (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground font-semibold mb-2">
                              {key}
                            </p>
                            <ul className="list-disc list-inside text-foreground space-y-1">
                              {value.map((v, i) => (
                                <li key={i}>{v}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      return (
                        <div key={key}>
                          <p className="text-xs text-muted-foreground font-semibold mb-1">
                            {key}
                          </p>
                          <p className="text-foreground whitespace-pre-wrap">
                            {String(value)}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
