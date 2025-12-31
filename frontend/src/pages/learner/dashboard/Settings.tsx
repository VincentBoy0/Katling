import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Switch } from "@/components/learner/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Bell, ChevronRight, Mic, Smartphone, Volume2 } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Local States cho các tùy chọn (Giả lập)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speakingEnabled, setSpeakingEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Tránh hydration mismatch cho theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    // Thêm confirm nếu cần
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate("/");
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-3xl mx-auto min-h-screen">
      {/* 1. HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Cài đặt
        </h1>
        <p className="text-muted-foreground font-medium text-lg">
          Tùy chỉnh trải nghiệm học tập của bạn.
        </p>
      </div>

      {/* 2. ACCOUNT SECTION */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground ml-1">Tài khoản</h2>
        <Card className="p-4 md:p-6 border-2 border-indigo-200 dark:border-indigo-900 bg-card rounded-2xl">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-black border-4 border-white dark:border-slate-800 shadow-sm shrink-0">
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold truncate">
                {user?.displayName}
              </h3>
              <p className="text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase border border-indigo-100 dark:border-indigo-800">
                  {user?.authProvider || "Học viên"}
                </span>
              </div>
            </div>

            <Link to="/dashboard/profile">
              <Button
                variant="outline"
                className="hidden md:flex font-bold border-2"
              >
                Chỉnh sửa
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* 3. LEARNING PREFERENCES */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground ml-1">
          Trải nghiệm học tập
        </h2>
        <Card className="border-2 border-border rounded-2xl overflow-hidden bg-card">
          {/* Sound Effects */}
          <div className="p-4 md:p-5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-foreground">Hiệu ứng âm thanh</p>
                <p className="text-sm text-muted-foreground">
                  Âm thanh khi đúng/sai
                </p>
              </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>

          {/* Speaking Exercises */}
          <div className="p-4 md:p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-foreground">Microphone</p>
                <p className="text-sm text-muted-foreground">
                  Cho phép microphone cho luyện nói
                </p>
              </div>
            </div>
            <Switch
              checked={speakingEnabled}
              onCheckedChange={setSpeakingEnabled}
            />
          </div>
        </Card>
      </section>

      {/* 4. GENERAL SETTINGS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground ml-1">
          Cài đặt chung
        </h2>
        <Card className="border-2 border-border rounded-2xl overflow-hidden bg-card">
          {/* Notifications */}
          <div className="p-4 md:p-5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-foreground">Nhắc nhở học tập</p>
                <p className="text-sm text-muted-foreground">
                  Thông báo đẩy hằng ngày
                </p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          {/* App Version (Info only) */}
          <div className="p-4 md:p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-foreground">Phiên bản ứng dụng</p>
                <p className="text-sm text-muted-foreground">
                  Katling v1.0.2 (Beta)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-muted px-2 py-1 rounded text-muted-foreground">
              Mới nhất
            </span>
          </div>
        </Card>
      </section>
    </div>
  );
}
