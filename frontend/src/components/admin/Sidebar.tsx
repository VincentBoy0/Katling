import { useUserInfo } from "@/hooks/useUserInfo";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  BookOpen,
  AlertCircle,
  Flag,
  FileText,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/context/theme-context";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
}: AdminSidebarProps) {
  const menuItems = [
    // { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "posts", label: "Posts", icon: FileText },
    // { id: "approval", label: "Post Approval", icon: FileCheck },
    { id: "library", label: "Content Library", icon: BookOpen },
    { id: "reports", label: "Reports", icon: Flag },
    // { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const { userInfo } = useUserInfo();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="font-bold text-sidebar-primary-foreground">
              EL
            </span>
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">Katling</h1>
            <p className="text-xs text-sidebar-foreground/60">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <ThemeToggleButton />
      </div>
    </aside>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      <span className="font-medium">
        {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
      </span>
    </button>
  );
}
