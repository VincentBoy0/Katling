import {
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Check,
  Clock,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { useUserInfo } from "@/hooks/useUserInfo";

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
  targetTab?: string;
};

interface AdminHeaderProps {
  onNavigate?: (tab: string) => void;
}

export default function AdminHeader({ onNavigate }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { userInfo } = useUserInfo();

  return (
    <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        {/* Nút Dark Mode */}
        {/* <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground" />
          )}
        </button> */}

        {/* Nút Settings */}
        {/* <button
          onClick={() => onNavigate?.("settings")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button> */}

        {/* User Info */}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {userInfo?.full_name}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate("/admin/login");
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
