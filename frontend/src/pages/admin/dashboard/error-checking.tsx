import { useState } from "react"
import { AlertCircle, CheckCircle, MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ErrorReport {
  id: string
  type: "bug" | "content" | "feature" | "other"
  title: string
  description: string
  content: string
  reportedBy: string
  reportedDate: string
  status: "open" | "in-progress" | "fixed"
  replies: number
}

export default function ErrorChecking() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null)
  const [replyText, setReplyText] = useState("")
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [errors, setErrors] = useState<ErrorReport[]>([
    {
      id: "ERR001",
      type: "bug",
      title: "Grammar lesson not loading",
      description: "Issue with loading grammar content",
      content:
        "When I click on the Advanced Grammar lesson, the page shows a loading spinner but never displays the content. I waited 5 minutes but nothing happened.",
      reportedBy: "John Doe",
      reportedDate: "2025-11-10",
      status: "open",
      replies: 0,
    },
    {
      id: "ERR002",
      type: "bug",
      title: "Pronunciation audio not playing",
      description: "Audio playback issue",
      content:
        "The audio files in the pronunciation section are not playing. I tried on Chrome and Firefox, same issue.",
      reportedBy: "Jane Smith",
      reportedDate: "2025-11-09",
      status: "in-progress",
      replies: 1,
    },
    {
      id: "ERR003",
      type: "content",
      title: "Wrong translation in vocabulary",
      description: "Incorrect translation data",
      content:
        'The word "persistent" is translated incorrectly. Current translation is wrong, should be something else.',
      reportedBy: "Mike Johnson",
      reportedDate: "2025-11-08",
      status: "fixed",
      replies: 2,
    },
  ])

  const statusColors = {
    open: "bg-red-100 text-red-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    fixed: "bg-green-100 text-green-800",
  }

  const typeColors = {
    bug: "text-red-600",
    content: "text-orange-600",
    feature: "text-blue-600",
    other: "text-gray-600",
  }

  const filteredErrors = errors.filter((error) => {
    if (activeTab === "all") return true
    return error.status === activeTab
  })

  const handleReply = () => {
    if (selectedError && replyText.trim()) {
      console.log("[v0] Admin replied to error:", selectedError.id, replyText)
      setReplyText("")
      setShowReplyBox(false)
    }
  }

  const handleFixed = () => {
    if (selectedError) {
      setErrors((prev) => prev.map((error) => (error.id === selectedError.id ? { ...error, status: "fixed" } : error)))
      setSelectedError(null)
    }
  }

  const handleDelete = (id: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== id))
    setSelectedError(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Error Checking</h1>
        <p className="text-muted-foreground">Manage user-reported errors and issues</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Error List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {["all", "open", "in-progress", "fixed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredErrors.map((error) => (
              <button
                key={error.id}
                onClick={() => setSelectedError(error)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedError?.id === error.id ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-1 ${typeColors[error.type]}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{error.id}</h3>
                    <p className="text-sm text-muted-foreground truncate">{error.title}</p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                        statusColors[error.status]
                      }`}
                    >
                      {error.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Details */}
        <div className="lg:col-span-2">
          {selectedError ? (
            <Card className="p-6 space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedError.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">ID: {selectedError.id}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      statusColors[selectedError.status]
                    }`}
                  >
                    {selectedError.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-border">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className={`font-medium capitalize ${typeColors[selectedError.type]}`}>{selectedError.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reported By</p>
                    <p className="font-medium text-foreground">{selectedError.reportedBy}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Report Date</p>
                    <p className="font-medium text-foreground">{selectedError.reportedDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Replies</p>
                    <p className="font-medium text-foreground">{selectedError.replies}</p>
                  </div>
                </div>
              </div>

              {/* Content Box */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Error Content</h3>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <p className="text-foreground whitespace-pre-wrap">{selectedError.content}</p>
                </div>
              </div>

              {/* Reply Section */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground">Communication</h3>
                {!showReplyBox ? (
                  <Button onClick={() => setShowReplyBox(true)} className="w-full justify-center" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Reply to User
                  </Button>
                ) : (
                  <div className="space-y-3 bg-muted p-4 rounded-lg">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleReply} disabled={!replyText.trim()} className="flex-1">
                        Send Reply
                      </Button>
                      <Button onClick={() => setShowReplyBox(false)} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={handleFixed}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={selectedError.status === "fixed"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Fixed
                </Button>
                <Button onClick={() => handleDelete(selectedError.id)} variant="destructive" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Report
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 flex items-center justify-center min-h-96">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select an error report to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
