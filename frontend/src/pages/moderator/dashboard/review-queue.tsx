import { CheckCircle, XCircle, MessageSquare, Clock } from "lucide-react"
import { useState } from "react"

const reviewItems = [
  {
    id: 1,
    content: "User comment on lesson",
    type: "Comment",
    author: "user123",
    submitted: "5 min ago",
    priority: "High",
  },
  { id: 2, content: "Forum post reply", type: "Post", author: "john_doe", submitted: "15 min ago", priority: "Medium" },
  {
    id: 3,
    content: "Lesson discussion thread",
    type: "Thread",
    author: "learner456",
    submitted: "2 hours ago",
    priority: "Low",
  },
  {
    id: 4,
    content: "User feedback submission",
    type: "Feedback",
    author: "sarah_lee",
    submitted: "3 hours ago",
    priority: "Medium",
  },
  {
    id: 5,
    content: "Community post",
    type: "Post",
    author: "language_lover",
    submitted: "4 hours ago",
    priority: "High",
  },
]

export default function ReviewQueue() {
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-600"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-600"
      case "Low":
        return "bg-green-500/20 text-green-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Review Queue</h2>
        <p className="text-muted-foreground mb-4">Content awaiting your review</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium">
            All ({reviewItems.length})
          </button>
          <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium">
            High Priority (2)
          </button>
          <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium">
            Recent
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {reviewItems.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedItems(
                selectedItems.includes(item.id)
                  ? selectedItems.filter((id) => id !== item.id)
                  : [...selectedItems, item.id],
              )
            }}
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => {}}
                className="mt-1 w-5 h-5 rounded border-border cursor-pointer accent-primary"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.content}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{item.type}</span>
                      <span className="text-xs text-muted-foreground">by {item.author}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-3">
                  <Clock className="w-4 h-4" />
                  Submitted {item.submitted}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg transition-colors font-medium text-sm">
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors font-medium text-sm">
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg transition-colors font-medium text-sm">
                <MessageSquare className="w-4 h-4" />
                Note
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
