import { DownloadCloud, TrendingUp, Users, BookOpen, Star } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const monthlyData = [
  { month: "Jan", revenue: 4000, users: 2400, engagement: 65, completions: 1800 },
  { month: "Feb", revenue: 3000, users: 1398, engagement: 58, completions: 1200 },
  { month: "Mar", revenue: 2000, users: 9800, engagement: 72, completions: 2400 },
  { month: "Apr", revenue: 2780, users: 3908, engagement: 68, completions: 1950 },
  { month: "May", revenue: 1890, users: 4800, engagement: 75, completions: 2100 },
  { month: "Jun", revenue: 2390, users: 3800, engagement: 70, completions: 2300 },
]

const categoryPerformance = [
  { category: "Vocabulary", views: 4500, completions: 3200, avgRating: 4.5 },
  { category: "Grammar", views: 3800, completions: 2800, avgRating: 4.3 },
  { category: "Pronunciation", views: 3200, completions: 2100, avgRating: 4.7 },
  { category: "Listening", views: 2900, completions: 1800, avgRating: 4.2 },
  { category: "Speaking", views: 2600, completions: 1600, avgRating: 4.4 },
]

const userRoleData = [
  { name: "Students", value: 8500, color: "#3b82f6" },
  { name: "Moderators", value: 120, color: "#a855f7" },
  { name: "Admins", value: 15, color: "#ef4444" },
]

const difficultyDistribution = [
  { level: "Beginner", students: 3200 },
  { level: "Intermediate", students: 3800 },
  { level: "Advanced", students: 1500 },
]

const engagementMetrics = [
  { metric: "Daily Active Users", value: 2340, change: "+12%" },
  { metric: "Avg Session Duration", value: "28 min", change: "+5%" },
  { metric: "Completion Rate", value: "68%", change: "+8%" },
  { metric: "User Retention", value: "82%", change: "+3%" },
]

const COLORS = ["#3b82f6", "#a855f7", "#ef4444"]

function StatCard({ icon: Icon, title, value, change }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-8 h-8 text-primary" />
        <span className="text-xs font-semibold text-green-600 bg-green-500/20 px-2 py-1 rounded-full">{change}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}

export default function AnalyticsReporting() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h2>
          <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
          <DownloadCloud className="w-5 h-5" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          title={engagementMetrics[0].metric}
          value={engagementMetrics[0].value}
          change={engagementMetrics[0].change}
        />
        <StatCard
          icon={BookOpen}
          title={engagementMetrics[1].metric}
          value={engagementMetrics[1].value}
          change={engagementMetrics[1].change}
        />
        <StatCard
          icon={TrendingUp}
          title={engagementMetrics[2].metric}
          value={engagementMetrics[2].value}
          change={engagementMetrics[2].change}
        />
        <StatCard
          icon={Star}
          title={engagementMetrics[3].metric}
          value={engagementMetrics[3].value}
          change={engagementMetrics[3].change}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Platform Metrics Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
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
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
              <Line type="monotone" dataKey="engagement" stroke="#a855f7" strokeWidth={2} name="Engagement %" />
              <Line type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2} name="Completions" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">User Distribution by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Content Performance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="category" stroke="var(--muted-foreground)" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="views" fill="#3b82f6" name="Views" />
              <Bar dataKey="completions" fill="#10b981" name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Student Distribution by Level</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={difficultyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="level" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="students" fill="#a855f7" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Category Analytics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Total Views</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Completions</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Completion Rate</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {categoryPerformance.map((cat) => (
                <tr key={cat.category} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-foreground font-medium">{cat.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.completions.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-green-600">
                      {((cat.completions / cat.views) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">{cat.avgRating} ⭐</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
