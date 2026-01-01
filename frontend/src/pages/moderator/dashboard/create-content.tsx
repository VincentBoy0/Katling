import { contentTypeDefinitions, type ContentType } from "@/lib/content-types";
import { Check, Upload } from "lucide-react";
import { useState } from "react";
import CategoryForm from "../../../components/moderator/CategoryForm";

const sessionCategories = Object.entries(contentTypeDefinitions).map(
  ([id, config]) => ({
    id: id as ContentType,
    label: config.name,
    color: config.color,
    icon: config.icon,
  })
);

export default function CreateContent() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ContentType | null>(
    null
  );
  const [difficulty, setDifficulty] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const [createdPosts, setCreatedPosts] = useState([
    {
      id: 1,
      title: "Past Tense Basics",
      category: "grammar",
      difficulty: "Beginner",
      createdAt: "2024-11-09",
      status: "Approved",
      data: {},
    },
  ]);

  const handleCategorySubmit = (categoryData: Record<string, any>) => {
    const newPost = {
      id: Math.max(...createdPosts.map((p) => p.id), 0) + 1,
      title:
        categoryData.lessonTitle ||
        categoryData.title ||
        categoryData.word ||
        categoryData.soundTitle ||
        categoryData.topic ||
        "Untitled",
      category: selectedCategory,
      difficulty,
      createdAt: new Date().toISOString().split("T")[0],
      status: "Pending Review",
      data: categoryData,
    };

    setCreatedPosts((prev) => [newPost, ...prev]);
    setConfirmingId(newPost.id);

    setTimeout(() => {
      setConfirmingId(null);
      setShowForm(false);
      setSelectedCategory(null);
      setDifficulty("");
    }, 1500);
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

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Create Content</h2>
          <p className="text-muted-foreground mt-2">
            Create and post new learning content for students
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
        >
          <Upload className="w-5 h-5" />
          Create New Post
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
            My Created Posts ({createdPosts.length})
          </h3>
        </div>

        {createdPosts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              No posts created yet. Create your first content!
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
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {createdPosts.map((post) => (
                  <tr
                    key={post.id}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      confirmingId === post.id ? "bg-green-500/10" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {post.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                          post.category
                        )}`}
                      >
                        {getCategoryLabel(post.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {post.difficulty}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {post.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          post.status === "Approved"
                            ? "bg-green-500/20 text-green-600"
                            : "bg-yellow-500/20 text-yellow-600"
                        }`}
                      >
                        {confirmingId === post.id && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {post.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
