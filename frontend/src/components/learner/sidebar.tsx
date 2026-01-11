import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", icon: Home, label: "Trang chủ" },
  { href: "/dashboard/learn", icon: BookOpen, label: "Học tập" },
  { href: "/dashboard/vocabulary", icon: Lightbulb, label: "Từ vựng" },
  { href: "/dashboard/practice", icon: Zap, label: "Luyện tập" },
  { href: "/dashboard/community", icon: Users, label: "Cộng đồng" },
  { href: "/dashboard/leaderboard", icon: Trophy, label: "Bảng xếp hạng" },
  { href: "/dashboard/profile", icon: User, label: "Hồ sơ" },
  { href: "/dashboard/settings", icon: Settings, label: "Cài đặt" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Collapsed state - stored in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-20 left-4 z-40"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <div
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${
          collapsed ? "w-20" : "w-64"
        } bg-card border-r border-border transition-all duration-300 ease-in-out md:relative fixed left-0 top-0 h-full z-40 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-center min-h-[72px]">
          {collapsed ? (
            <img
              src="/img/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          ) : (
            <img
              src={
                theme === "dark"
                  ? "/img/logo_with_name_dark.png"
                  : "/img/logo_with_name.png"
              }
              alt="Logo"
              className="w-3/4 h-auto"
            />
          )}
        </div>

        {/* Collapse toggle button - Desktop only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-card shadow-md hover:bg-muted z-50"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href);
                  setOpen(false);
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          {/* Dark mode toggle */}
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between px-2"
            }`}
          >
            {!collapsed && (
              <span className="text-sm font-medium text-muted-foreground">
                Giao diện
              </span>
            )}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>

          {/* Logout button */}
          <Button
            variant="ghost"
            className={`w-full gap-3 ${
              collapsed ? "justify-center px-0" : "justify-start"
            }`}
            title={collapsed ? "Đăng xuất" : undefined}
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </Button>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
