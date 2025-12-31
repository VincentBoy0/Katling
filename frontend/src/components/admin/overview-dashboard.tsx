"use client"

import { Users, BookOpen, TrendingUp, AlertCircle } from "lucide-react"
import StatCard from "./stat-card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const chartData = [
  { name: "Mon", users: 400, lessons: 240 },
  { name: "Tue", users: 520, lessons: 290 },
  { name: "Wed", users: 480, lessons: 200 },
  { name: "Thu", users: 690, lessons: 320 },
  { name: "Fri", users: 780, lessons: 450 },
  { name: "Sat", users: 890, lessons: 520 },
  { name: "Sun", users: 1200, lessons: 680 },
]

export default function OverviewDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back, Admin</h2>
        <p className="text-muted-foreground">Here's what's happening with your platform today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users} label="Total Users" value="12,548" change="+12%" trend="up" />
        <StatCard icon={BookOpen} label="Active Lessons" value="3,429" change="+5%" trend="up" />
        <StatCard icon={TrendingUp} label="Completion Rate" value="78.5%" change="+2%" trend="up" />
        <StatCard icon={AlertCircle} label="Pending Reviews" value="24" change="-8%" trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">User Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
              <Line type="monotone" dataKey="users" stroke="var(--chart-1)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Lessons Completed</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
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
              <Bar dataKey="lessons" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
