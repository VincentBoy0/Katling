"use client";

import {
  Bell,
  LogOut,
  User,
  Moon,
  Sun,
  Settings,
  Check,
  Clock,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useUserInfo } from "@/hooks/useUserInfo";

// Kiểu dữ liệu thông báo
type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  targetTab?: string;
};

interface ModeratorHeaderProps {
  onNavigate?: (tab: string) => void;
}

export default function ModeratorHeader({ onNavigate }: ModeratorHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useUserInfo();

  // // Mock Data cho Moderator
  // const [notifications, setNotifications] = useState<Notification[]>([
  //   {
  //     id: 1,
  //     title: "Báo cáo vi phạm mới",
  //     message: "User A đã báo cáo một bình luận xúc phạm.",
  //     time: "2 phút trước",
  //     read: false,
  //     targetTab: "reports", // Chuyển đến tab Báo cáo
  //   },
  //   {
  //     id: 2,
  //     title: "Kháng cáo từ người dùng",
  //     message: "User B yêu cầu xem xét lại lệnh cấm.",
  //     time: "30 phút trước",
  //     read: false,
  //     targetTab: "appeals", // Chuyển đến tab Kháng cáo
  //   },
  //   {
  //     id: 3,
  //     title: "Hàng chờ duyệt",
  //     message: "Có 15 bài viết mới cần phê duyệt.",
  //     time: "1 giờ trước",
  //     read: true,
  //     targetTab: "review", // Chuyển đến tab Duyệt bài
  //   },
  // ]);

  // const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setMounted(true);

    // Đóng menu khi click ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const handleNotificationClick = (notification: Notification) => {
  //   setNotifications((prev) =>
  //     prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
  //   );
  //   if (notification.targetTab && onNavigate) {
  //     onNavigate(notification.targetTab);
  //     setShowNotifications(false);
  //   }
  // };

  // const markAllAsRead = () => {
  //   setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  // };

  return (
    <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <h1 className="text-2xl font-bold text-foreground">
        Moderator Dashboard
      </h1>
      {/* <div className="flex items-center gap-4">
        {/* --- MENU THÔNG BÁO --- */}
      {/* <div className="relative" ref={notificationRef}>  */}
      {/* <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg transition-colors ${
              showNotifications ? "bg-muted" : "hover:bg-muted"
            }`}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive border-2 border-card rounded-full animate-pulse"></span>
            )}
          </button> */}

      {/* {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-semibold text-foreground">
                  Thông báo ({unreadCount})
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Đã đọc
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Không có thông báo.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-4 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/50 flex gap-3 ${
                        !item.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          !item.read ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <p
                          className={`text-sm ${
                            !item.read
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                          <Clock className="w-3 h-3" /> {item.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div> */}

      {/* Nút bật/tắt Dark Mode */}
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
            navigate("/moderator/login");
          }}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <LogOut className="w-4 h-4 text-muted-foreground" />
        </button>
        {/* </div> */}
      </div>
    </header>
  );
}
