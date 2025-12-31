import { BookOpen, Edit2, Trash2, Filter } from "lucide-react"
import { useState } from "react"

const approvedContent = [
  {
    id: 1,
    type: "Lessons",
    title: "Advanced Grammar Rules",
    actor: "John Doe",
    date: "2024-01-18",
    content:
      "Detailed content about advanced grammar rules including complex sentence structures, tense usage, and subordinate clauses.",
  },
  {
    id: 2,
    type: "Vocabulary",
    title: "Slang words collection",
    actor: "Jane Smith",
    date: "2024-01-17",
    content: "Modern slang words commonly used in everyday conversations: cool, awesome, lit, vibe, etc.",
  },
  {
    id: 3,
    type: "Pronunciation",
    title: "Advanced phonetics guide",
    actor: "Mike Johnson",
    date: "2024-01-18",
    content: "Step-by-step guide for improving pronunciation with IPA symbols and mouth positioning techniques.",
  },
  {
    id: 4,
    type: "Grammar",
    title: "Tense explanations",
    actor: "Tom Wilson",
    date: "2024-01-16",
    content: "Complete guide to English tenses: present simple, past perfect, future continuous, and more.",
  },
  {
    id: 5,
    type: "Listening",
    title: "Business conversation skills",
    actor: "Sarah Lee",
    date: "2024-01-15",
    content: "Audio transcripts and exercises for improving listening comprehension in business contexts.",
  },
  {
    id: 6,
    type: "Speaking",
    title: "Public speaking techniques",
    actor: "Emma Davis",
    date: "2024-01-14",
    content: "Strategies and practice exercises for confident public speaking and presentation skills.",
  },
]

const contentTypes = ["All", "Lessons", "Vocabulary", "Pronunciation", "Grammar", "Listening", "Speaking"]

const typeColors = {
  Lessons: "bg-blue-500/20 text-blue-600",
  Vocabulary: "bg-green-500/20 text-green-600",
  Pronunciation: "bg-orange-500/20 text-orange-600",
  Grammar: "bg-purple-500/20 text-purple-600",
  Listening: "bg-pink-500/20 text-pink-600",
  Speaking: "bg-indigo-500/20 text-indigo-600",
}

export default function ContentLibrary() {
  const [selectedType, setSelectedType] = useState("All")
  const [selectedContent, setSelectedContent] = useState<(typeof approvedContent)[0] | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")

  const handleViewContent = (content: (typeof approvedContent)[0]) => {
    setSelectedContent(content)
    setEditContent(content.content)
  }

  const handleSaveEdit = () => {
    if (selectedContent) {
      const index = approvedContent.findIndex((c) => c.id === selectedContent.id)
      if (index !== -1) {
        approvedContent[index].content = editContent
        setSelectedContent({ ...approvedContent[index] })
        setEditingId(null)
      }
    }
  }

  const handleDelete = (id: number) => {
    const index = approvedContent.findIndex((c) => c.id === id)
    if (index !== -1) {
      approvedContent.splice(index, 1)
      setSelectedContent(null)
    }
  }

  const filteredContent = approvedContent.filter((item) => selectedType === "All" || item.type === selectedType)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Content Library</h2>
        <p className="text-muted-foreground mb-6">View all approved learning content</p>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-muted-foreground">Filter by Type</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {contentTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {filteredContent.length} Record{filteredContent.length !== 1 ? "s" : ""}
          </h3>
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredContent.length > 0 ? (
              filteredContent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleViewContent(item)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedContent?.id === item.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${typeColors[item.type]}`}>
                      {item.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.id}</span>
                  </div>
                  <p className="font-medium text-foreground text-sm line-clamp-2">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No content found</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Detail */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <div className="bg-card rounded-xl border border-border p-6 h-fit">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded font-semibold ${typeColors[selectedContent.type]}`}
                      >
                        {selectedContent.type}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">ID: {selectedContent.id}</span>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4">{selectedContent.title}</h3>

                <div className="space-y-2 mb-6">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Created by:</span> {selectedContent.actor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Date:</span> {selectedContent.date}
                  </p>
                </div>

                <div className="border-t border-border pt-6">
                  <p className="text-sm font-semibold text-foreground mb-3">Content</p>
                  {editingId === selectedContent.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-lg text-foreground text-sm min-h-48 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{selectedContent.content}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-6 border-t border-border">
                {editingId === selectedContent.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditContent(selectedContent.content)
                      }}
                      className="flex-1 px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingId(selectedContent.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-lg font-medium transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedContent.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-12 flex items-center justify-center min-h-96">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a content record to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
