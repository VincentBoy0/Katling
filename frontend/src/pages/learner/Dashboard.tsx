import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/learner/button";
import { Card } from "@/components/learner/card";
import { useAuth } from "@/context/auth-context";
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  Flame,
  Gift,
  Mic,
  Play,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { toast } from "sonner"; // Import để hiện thông báo

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // State để theo dõi các nhiệm vụ đã nhận thưởng
  const [claimedTasks, setClaimedTasks] = useState<number[]>([]);

  // Dữ liệu nhiệm vụ mẫu
  const dailyTasks = [
    {
      id: 1,
      name: "Kiếm 20 XP",
      icon: Zap,
      reward: 10,
      progress: 20,
      total: 20,
    },
    {
      id: 2,
      name: "Luyện phát âm 5 từ",
      icon: Mic,
      reward: 15,
      progress: 2,
      total: 5,
    },
    {
      id: 3,
      name: "Duy trì chuỗi Streak",
      icon: Flame,
      reward: 20,
      progress: 1,
      total: 1,
    },
    {
      id: 4,
      name: "Học đủ 15 phút",
      icon: Clock,
      reward: 20,
      progress: 15,
      total: 15,
    },
  ];

  // Hàm xử lý khi bấm nút "Nhận"
  const handleClaim = (taskId: number, reward: number) => {
    // 1. Cập nhật state local để ẩn nút
    setClaimedTasks([...claimedTasks, taskId]);

    // 2. Cập nhật XP cho user (Giả lập)
    const newExp = (user?.exp || 0) + reward;
    updateUser({ exp: newExp });

    // 3. Hiện thông báo (Toast)
    toast.success("Nhận thưởng thành công!", {
      description: `Bạn đã nhận được +${reward} XP`,
      icon: <Gift className="w-5 h-5 text-green-600" />,
      duration: 3000,
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      {/* 1. WELCOME & CONTINUE LEARNING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Welcome & Next Lesson */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Chào buổi sáng, {user?.displayName?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground font-medium">
              Bạn đã sẵn sàng chinh phục bài học tiếp theo chưa?
            </p>
          </div>

          <Card className="relative overflow-hidden border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/10 p-6 md:p-8 rounded-3xl">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-200/50 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  Unit 3 • Bài 4
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-indigo-900 dark:text-indigo-100">
                  Giao tiếp tại nhà hàng
                </h2>
                <p className="text-indigo-700 dark:text-indigo-300 font-medium">
                  Học cách gọi món và thanh toán hóa đơn.
                </p>
              </div>

              <Button
                onClick={() => navigate("/dashboard/learn")}
                className="h-14 text-lg font-bold hover:bg-primary/90 shadow-md hover:translate-y-[-2px] active:translate-y-0 transition-all shrink-0 w-full md:w-auto"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Học tiếp
              </Button>
            </div>

            {/* Decor */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          </Card>
        </div>

        {/* Right: Event Banner */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-primary text-primary-foreground p-6 rounded-3xl border-2 border-primary-foreground/20 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary-foreground/80 font-bold text-xs uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4" />
                Sự kiện tháng 12
              </div>
              <h3 className="text-xl font-black leading-tight mb-2">
                Lễ hội Âm nhạc Mèo Katling 🎵
              </h3>
              <p className="text-sm text-primary-foreground/90 font-medium mb-4">
                Thu thập 30 nốt nhạc để nhận huy hiệu!
              </p>
            </div>

            <div className="relative z-10 bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span>Tiến độ</span>
                <span>12/30</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[40%]"></div>
              </div>
            </div>

            {/* Stars Decor */}
            <Star className="absolute top-4 right-4 text-accent w-8 h-8 animate-pulse fill-accent" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </Card>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <Card className="p-4 flex flex-col items-center justify-center gap-2 border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl hover:-translate-y-1 transition-transform cursor-default">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <Flame className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-700 dark:text-orange-500">
              {user?.streak}
            </p>
            <p className="text-xs font-bold text-orange-600/70 uppercase">
              Streak
            </p>
          </div>
        </Card>

        {/* XP */}
        <Card className="p-4 flex flex-col items-center justify-center gap-2 border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl hover:-translate-y-1 transition-transform cursor-default">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <Zap className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-500">
              {user?.exp}
            </p>
            <p className="text-xs font-bold text-emerald-600/70 uppercase">
              Tổng XP
            </p>
          </div>
        </Card>

        {/* Level */}
        <Card className="p-4 flex flex-col items-center justify-center gap-2 border-2 border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl hover:-translate-y-1 transition-transform cursor-default">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-purple-700 dark:text-purple-500">
              {user?.level}
            </p>
            <p className="text-xs font-bold text-purple-600/70 uppercase">
              Level
            </p>
          </div>
        </Card>

        {/* Goal */}
        <Card className="p-4 flex flex-col items-center justify-center gap-2 border-2 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl hover:-translate-y-1 transition-transform cursor-default">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <Target className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-blue-700 dark:text-blue-500">
              85%
            </p>
            <p className="text-xs font-bold text-blue-600/70 uppercase">
              Mục tiêu
            </p>
          </div>
        </Card>
      </div>

      {/* 3. DAILY QUESTS - CLEAN & THEME-BASED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Nhiệm vụ hằng ngày
          </h2>
          <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Kết thúc sau 8h</span>
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl divide-y divide-border overflow-hidden">
          {dailyTasks.map((task) => {
            const progressPercent = (task.progress / task.total) * 100;
            const isFinished = task.progress >= task.total;
            const isClaimed = claimedTasks.includes(task.id);
            const Icon = task.icon;

            return (
              <div
                key={task.id}
                className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group"
              >
                {/* Unified Icon Style: Tím nhạt đồng bộ theme */}
                <div
                  className={`
                  w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 border-transparent
                  group-hover:scale-105 transition-transform
                  ${
                    isFinished
                      ? "bg-green-100 text-green-600"
                      : "bg-primary/10 text-primary"
                  }
                `}
                >
                  {isFinished ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h3
                      className={`font-bold text-sm md:text-base truncate ${
                        isClaimed ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {task.name}
                    </h3>

                    {/* Reward Badge: Màu Accent (Mint) */}
                    {!isClaimed && (
                      <div className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-100 dark:bg-teal-900/50 dark:text-teal-400 px-2 py-0.5 rounded-md">
                        <Gift className="w-3 h-3" />+{task.reward} XP
                      </div>
                    )}
                  </div>

                  {/* Progress Bar: Màu Primary (Tím) */}
                  <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`
                           absolute top-0 left-0 h-full rounded-full transition-all duration-500
                           ${isFinished ? "bg-green-500" : "bg-primary"}
                         `}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                    <span>
                      {task.progress}/{task.total}
                    </span>
                    {isFinished && !isClaimed && (
                      <span className="text-green-600">Hoàn thành</span>
                    )}
                    {isClaimed && (
                      <span className="text-muted-foreground">Đã nhận</span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pl-2 shrink-0">
                  {isFinished && !isClaimed ? (
                    <Button
                      size="sm"
                      onClick={() => handleClaim(task.id, task.reward)}
                      className="h-9 px-4 bg-green-500 hover:bg-green-600 text-white font-bold shadow-sm animate-bounce-subtle border-green-700 active:border-b-0 active:translate-y-1 transition-all"
                    >
                      Nhận
                    </Button>
                  ) : isClaimed ? (
                    <div className="w-9 h-9 flex items-center justify-center">
                      <Check className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
