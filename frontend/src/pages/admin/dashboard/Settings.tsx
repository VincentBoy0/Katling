"use client";

import { useTheme } from "next-themes";
import { User, Moon, Sun, Monitor, Bell, Save, Camera } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminSettings() {
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
        <h2 className="text-2xl font-bold text-foreground">Cài đặt hệ thống</h2>
        <p className="text-muted-foreground">
          Quản lý giao diện và tài khoản quản trị viên.
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
          Thông tin cá nhân
        </h3>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <User className="w-12 h-12 text-muted-foreground" />
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Họ tên
                </label>
                <input
                  defaultValue="Admin User"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  defaultValue="admin@english.com"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 flex items-center gap-2">
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Thông báo
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Thông báo Email</p>
              <p className="text-sm text-muted-foreground">
                Nhận báo cáo hàng ngày qua email.
              </p>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
