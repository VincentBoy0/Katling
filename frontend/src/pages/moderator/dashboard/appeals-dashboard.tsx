import { MessageSquare, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"

const appeals = [
  {
    id: 1,
    user: "user123",
    reason: "Account suspension",
    appealDate: "2024-01-18",
    status: "Pending",
    action: "Content Moderation",
  },
  {
    id: 2,
    user: "john_doe",
    reason: "Post removal",
    appealDate: "2024-01-17",
    status: "In Review",
    action: "Content Violation",
  },
  {
    id: 3,
    user: "sarah_lee",
    reason: "Account suspension",
    appealDate: "2024-01-16",
    status: "Approved",
    action: "Harassment Report",
  },
  {
    id: 4,
    user: "member456",
    reason: "Comment deleted",
    appealDate: "2024-01-15",
    status: "Denied",
    action: "Spam Report",
  },
]

export default function AppealsDashboard() {
  const [selectedAppeal, setSelectedAppeal] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-600"
      case "In Review":
        return "bg-blue-500/20 text-blue-600"
      case "Approved":
        return "bg-green-500/20 text-green-600"
      case "Denied":
        return "bg-red-500/20 text-red-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">User Appeals</h2>
        <p className="text-muted-foreground">Review and respond to user appeals and grievances</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {appeals.map((appeal) => (
              <div
                key={appeal.id}
                onClick={() => setSelectedAppeal(appeal.id)}
                className={`bg-card rounded-xl border transition-all cursor-pointer p-6 ${
                  selectedAppeal === appeal.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{appeal.user}</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{appeal.action}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{appeal.reason}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Submitted: {appeal.appealDate}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(appeal.status)}`}>
                    {appeal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedAppeal && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Appeal Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">User ID</p>
                <p className="text-foreground font-medium">{appeals.find((a) => a.id === selectedAppeal)?.user}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Appeal Reason</p>
                <p className="text-foreground font-medium">{appeals.find((a) => a.id === selectedAppeal)?.reason}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Original Action</p>
                <p className="text-foreground font-medium">{appeals.find((a) => a.id === selectedAppeal)?.action}</p>
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg transition-colors font-medium text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Approve Appeal
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors font-medium text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Deny Appeal
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-lg transition-colors font-medium text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Add Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
