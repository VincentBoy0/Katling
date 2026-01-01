import { useTheme } from "next-themes";
import { User, Moon, Sun, Monitor, Bell, Save, Camera, Shield, } from "lucide-react";
import { useEffect, useState } from "react";

export default function ModeratorSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const ToggleSwitch = ({ defaultChecked = false }) => (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        defaultChecked={defaultChecked}
      />
      <div className="relative w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
  );

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Cài đặt Moderator
        </h2>
        <p className="text-muted-foreground">
          Quản lý tài khoản kiểm duyệt và giao diện làm việc.
        </p>
      </div>

      {/* Theme Settings */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          Giao diện
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["light", "dark", "system"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex flex-col items-center justify-between p-4 rounded-lg border-2 transition-all hover:bg-muted ${
                theme === t
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-background"
              }`}
            >
              {t === "light" && <Sun className="w-6 h-6 mb-2" />}
              {t === "dark" && <Moon className="w-6 h-6 mb-2" />}
              {t === "system" && <Monitor className="w-6 h-6 mb-2" />}
              <span className="capitalize font-medium text-foreground">
                {t === "system" ? "Hệ thống" : t === "light" ? "Sáng" : "Tối"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Hồ sơ kiểm duyệt viên
        </h3>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <User className="w-12 h-12 text-muted-foreground" />
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <Shield className="w-3 h-3 mr-1" /> Moderator
            </span>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tên hiển thị
                </label>
                <input
                  defaultValue="Mod User"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email công việc
                </label>
                <input
                  defaultValue="mod@english.com"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Preferences */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Tuỳ chọn công việc
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <p className="font-medium text-foreground">
                Thông báo báo cáo mới
              </p>
              <p className="text-sm text-muted-foreground">
                Nhận thông báo ngay lập tức khi người dùng gửi báo cáo.
              </p>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Tự động nhận việc</p>
              <p className="text-sm text-muted-foreground">
                Tự động gán bài viết tiếp theo sau khi duyệt xong.
              </p>
            </div>
            <ToggleSwitch defaultChecked={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
