"use client";

import {
  LayoutDashboard,
  Eye,
  Flag,
  MessageSquare,
  Upload,
} from "lucide-react";

interface ModeratorSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ModeratorSidebar({
  activeTab,
  setActiveTab,
}: ModeratorSidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "create", label: "Create Content", icon: Upload },
    { id: "review", label: "Review Queue", icon: Eye },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "appeals", label: "Appeals", icon: MessageSquare },
  ];

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
            <h1 className="font-bold text-sidebar-foreground">English Learn</h1>
            <p className="text-xs text-sidebar-foreground/60">
              Moderator Panel
            </p>
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
    </aside>
  );
}
