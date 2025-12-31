import type React from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { Button } from "@/components/learner/button";
import { Switch } from "@/components/learner/switch";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import {
  BookOpen,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  Settings,
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
        } md:translate-x-0 w-64 bg-card border-r border-border transition-transform duration-200 ease-in-out md:relative fixed left-0 top-0 h-full z-40 flex flex-col`}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <img
              src={
                theme === "dark"
                  ? "/logo_with_name_dark.png"
                  : "/logo_with_name.png"
              }
              alt="Logo"
              width={0}
              height={0}
              sizes="100vw"
              className="w-3/4 h-auto mx-auto"
            />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          {/* Dark mode switch */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dark mode</span>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>

          {/* Logout button */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
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
