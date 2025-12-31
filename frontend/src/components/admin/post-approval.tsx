"use client"

import { Flag, CheckCircle, XCircle, Clock, Edit2 } from "lucide-react"
import { useState } from "react"

const pendingPosts = [
  {
    id: 1,
    category: "Lessons",
    title: "Advanced Grammar Rules",
    moderator: "John Doe",
    reason: "New content submission",
    status: "Pending",
    date: "2024-01-18",
    categoryData: { content: "Detailed content about advanced grammar rules..." },
  },
  {
    id: 2,
    category: "Vocabulary",
    title: "Slang words collection",
    moderator: "Jane Smith",
    reason: "New vocabulary set",
    status: "Reviewed",
    date: "2024-01-17",
    categoryData: { words: "List of slang words..." },
  },
  {
    id: 3,
    category: "Pronunciation",
    title: "Advanced phonetics guide",
    moderator: "Mike Johnson",
    reason: "New pronunciation guide",
    status: "Pending",
    date: "2024-01-18",
    categoryData: { guide: "Steps for improving pronunciation..." },
  },
  {
    id: 4,
    category: "Lessons",
    title: "Vocabulary Builder",
    moderator: "Sarah Lee",
    reason: "New lesson",
    status: "Reviewed",
    date: "2024-01-16",
    categoryData: { builder: "Explanation of vocabulary builder..." },
  },
  {
    id: 5,
    category: "Grammar",
    title: "Tense explanations",
    moderator: "Tom Wilson",
    reason: "Updated grammar content",
    status: "Pending",
    date: "2024-01-18",
    categoryData: { tenses: "Detailed explanations of different tenses..." },
  },
]

const contentCategories = ["All", "Lessons", "Vocabulary", "Pronunciation", "Grammar", "Listening", "Speaking"]

const categoryColors = {
  Lessons: "bg-blue-500/20 text-blue-600",
  Vocabulary: "bg-green-500/20 text-green-600",
  Pronunciation: "bg-orange-500/20 text-orange-600",
  Grammar: "bg-purple-500/20 text-purple-600",
  Listening: "bg-pink-500/20 text-pink-600",
  Speaking: "bg-indigo-500/20 text-indigo-600",
}

export default function PostApproval() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [confirmingAction, setConfirmingAction] = useState<{ [key: number]: string | null }>({})
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleApprove = (contentId: number) => {
    setConfirmingAction((prev) => ({ ...prev, [contentId]: "approved" }))
    const content = pendingPosts.find((c) => c.id === contentId)
    if (content) content.status = "Approved"

    setTimeout(() => {
      setConfirmingAction((prev) => ({ ...prev, [contentId]: null }))
    }, 1500)
  }

  const handleReject = (contentId: number) => {
    setConfirmingAction((prev) => ({ ...prev, [contentId]: "rejected" }))
    const content = pendingPosts.find((c) => c.id === contentId)
    if (content) content.status = "Rejected"

    setTimeout(() => {
      setConfirmingAction((prev) => ({ ...prev, [contentId]: null }))
    }, 1500)
  }

  const filteredContent = pendingPosts.filter((item) => {
    const statusMatch = selectedStatus === "all" || item.status.toLowerCase() === selectedStatus.toLowerCase()
    const categoryMatch = selectedCategory === "All" || item.category === selectedCategory
    return statusMatch && categoryMatch
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">Post Approval</h2>
        <p className="text-muted-foreground mb-6">Review and approve moderator-posted content</p>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3">Filter by Category</p>
            <div className="flex gap-2 flex-wrap">
              {contentCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3">Filter by Status</p>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "reviewed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize text-sm ${
                    selectedStatus === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredContent.length > 0 ? (
          filteredContent.map((content) => (
            <div
              key={content.id}
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Flag className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{content.title}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${categoryColors[content.category]}`}
                      >
                        {content.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Posted by: <span className="text-foreground font-medium">{content.moderator}</span>
                    </p>
                    <p className="text-sm text-blue-600">Type: {content.reason}</p>

                    {content.categoryData && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border text-sm">
                        <p className="font-semibold text-foreground mb-2">Content Preview:</p>
                        <div className="space-y-1 text-muted-foreground">
                          {Object.entries(content.categoryData)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <p key={key}>
                                <span className="font-medium">{key}:</span> {String(value).substring(0, 50)}
                                {String(value).length > 50 ? "..." : ""}
                              </p>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                      content.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : "bg-green-500/20 text-green-600"
                    }`}
                  >
                    {content.status === "Pending" ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {content.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">{content.date}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(content.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 transition-colors font-medium text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleApprove(content.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                      confirmingAction[content.id] === "approved"
                        ? "bg-green-500/30 text-green-600"
                        : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                    }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${confirmingAction[content.id] === "approved" ? "animate-pulse" : ""}`}
                    />
                    {confirmingAction[content.id] === "approved" ? "Approved" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(content.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                      confirmingAction[content.id] === "rejected"
                        ? "bg-red-500/30 text-red-600"
                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    }`}
                  >
                    <XCircle
                      className={`w-4 h-4 ${confirmingAction[content.id] === "rejected" ? "animate-pulse" : ""}`}
                    />
                    {confirmingAction[content.id] === "rejected" ? "Rejected" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
