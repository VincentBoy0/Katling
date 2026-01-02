import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Clock, Flame, Gift, Mic, Target, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";

// Components
import WelcomeHeader from "@/components/learner/dashboard/WelcomeHeader";
import ContinueLearningCard from "@/components/learner/dashboard/ContinueLearningCard";
import EventBanner from "@/components/learner/dashboard/EventBanner";
import StatCard from "@/components/learner/dashboard/StatCard";
import DailyQuestsSection from "@/components/learner/dashboard/DailyQuestsSection";
import { DailyTask } from "@/components/learner/dashboard/DailyTaskItem";

import { useUserInfo } from "@/hooks/useUserInfo";
import { useUserPoints } from "@/hooks/useUserPoints";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const { userInfo } = useUserInfo();
  const { userPoints } = useUserPoints();
  const navigate = useNavigate();

  const [claimedTasks, setClaimedTasks] = useState<number[]>([]);

  const dailyTasks: DailyTask[] = [
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

  const handleClaim = (taskId: number, reward: number) => {
    setClaimedTasks([...claimedTasks, taskId]);
    const newExp = (user?.exp || 0) + reward;
    updateUser({ exp: newExp });

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
        <div className="lg:col-span-2 space-y-6">
          <WelcomeHeader userName={userInfo?.full_name || "Katlinger"} />

          <ContinueLearningCard
            unit="Unit 3"
            lesson="Bài 4"
            title="Giao tiếp tại nhà hàng"
            description="Học cách gọi món và thanh toán hóa đơn."
            onContinue={() => navigate("/dashboard/learn")}
          />
        </div>

        <div className="lg:col-span-1">
          <EventBanner
            eventName="Sự kiện tháng 12"
            title="Lễ hội Âm nhạc Mèo Katling 🎵"
            description="Thu thập 30 nốt nhạc để nhận huy hiệu!"
            progress={12}
            total={30}
          />
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          value={userPoints?.streak || 0}
          label="Streak"
          colorScheme="orange"
        />
        <StatCard
          icon={Zap}
          value={userPoints?.xp || 0}
          label="Tổng XP"
          colorScheme="emerald"
        />
        <StatCard
          icon={Trophy}
          value={user?.level || 0}
          label="Level"
          colorScheme="purple"
        />
        <StatCard
          icon={Target}
          value="85%"
          label="Mục tiêu"
          colorScheme="blue"
        />
      </div>

      {/* 3. DAILY QUESTS */}
      <DailyQuestsSection
        tasks={dailyTasks}
        claimedTasks={claimedTasks}
        onClaim={handleClaim}
        timeRemaining="8h"
      />
    </div>
  );
}
