"use client"

import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react"
import StatCard from "@/components/admin/stat-card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const activityData = [
  { day: "Mon", reviewed: 12, pending: 8 },
  { day: "Tue", reviewed: 15, pending: 6 },
  { day: "Wed", reviewed: 10, pending: 9 },
  { day: "Thu", reviewed: 18, pending: 4 },
  { day: "Fri", reviewed: 20, pending: 2 },
  { day: "Sat", reviewed: 8, pending: 5 },
  { day: "Sun", reviewed: 6, pending: 7 },
]

export default function ModeratorOverview() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Moderation Overview</h2>
        <p className="text-muted-foreground">Your moderation statistics and pending actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={CheckCircle} label="Reviewed Today" value="24" change="+18%" trend="up" />
        <StatCard icon={Clock} label="Pending Review" value="12" change="-5%" trend="down" />
        <StatCard icon={AlertCircle} label="Escalated Cases" value="3" change="+1%" trend="up" />
        <StatCard icon={TrendingUp} label="Approval Rate" value="92%" change="+3%" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="reviewed" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="var(--chart-4)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Review Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="reviewed" stroke="var(--chart-2)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
