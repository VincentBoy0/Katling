"use client"

import { User } from "lucide-react"
import { useState } from "react"

const reports = [
  {
    id: 1,
    reportedUser: "user@example.com",
    reporter: "John Doe",
    reason: "Harassment",
    severity: "High",
    date: "2024-01-18",
    status: "Open",
  },
  {
    id: 2,
    reportedUser: "test@example.com",
    reporter: "Jane Smith",
    reason: "Spam",
    severity: "Medium",
    date: "2024-01-17",
    status: "Under Review",
  },
  {
    id: 3,
    reportedUser: "member@example.com",
    reporter: "Bob Johnson",
    reason: "Inappropriate content",
    severity: "High",
    date: "2024-01-16",
    status: "Closed",
  },
  {
    id: 4,
    reportedUser: "student@example.com",
    reporter: "Lisa Anderson",
    reason: "Cheating",
    severity: "Low",
    date: "2024-01-15",
    status: "Open",
  },
]

export default function UserReports() {
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredReports = filterStatus === "all" ? reports : reports.filter((r) => r.status === filterStatus)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-500/20 text-red-600"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-600"
      case "Low":
        return "bg-blue-500/20 text-blue-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">User Reports</h2>
        <div className="flex gap-2">
          {["all", "Open", "Under Review", "Closed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm capitalize ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Reported User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Reporter</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Severity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground font-medium">{report.reportedUser}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{report.reporter}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{report.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${getSeverityColor(report.severity)}`}
                    >
                      {report.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        report.status === "Open"
                          ? "bg-orange-500/20 text-orange-600"
                          : report.status === "Under Review"
                            ? "bg-blue-500/20 text-blue-600"
                            : "bg-green-500/20 text-green-600"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{report.date}</td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-sm font-medium transition-colors">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
