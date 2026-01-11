import { useNavigate } from "react-router-dom";
import { Battery, Flame, Target, Zap } from "lucide-react";

import WelcomeHeader from "@/components/learner/dashboard/WelcomeHeader";
import ContinueLearningCard from "@/components/learner/dashboard/ContinueLearningCard";
import EventBanner from "@/components/learner/dashboard/EventBanner";
import StatCard from "@/components/learner/dashboard/StatCard";
import DailyMissionsSection from "@/components/learner/dashboard/DailyMissionsSection";

import { useUserInfo } from "@/hooks/useUserInfo";
import { useSummary } from "@/hooks/useSummary";
import { useDailyMissions } from "@/hooks/useDailyMissions";

export default function Dashboard() {
  const { userInfo } = useUserInfo();
  const { summary, refetchSummary } = useSummary();
  const navigate = useNavigate();

  const {
    missions,
    loading: loadingMissions,
    claimingId,
    timeRemaining,
    claimMission,
  } = useDailyMissions(() => {
    setTimeout(() => {
      refetchSummary();
    }, 0);
  });

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
          value={summary?.streak || 0}
          label="Streak"
          colorScheme="orange"
        />
        <StatCard
          icon={Zap}
          value={summary?.xp || 0}
          label="Tổng XP"
          colorScheme="emerald"
        />
        <StatCard
          icon={Battery}
          value={`${summary?.energy || 0}/${summary?.max_energy || 30}`}
          label="Năng lượng"
          colorScheme="yellow"
        />
        <StatCard
          icon={Target}
          value="85%"
          label="Mục tiêu"
          colorScheme="blue"
        />
      </div>

      {/* 3. DAILY MISSIONS */}
      <DailyMissionsSection
        missions={missions}
        onClaim={claimMission}
        claimingId={claimingId}
        timeRemaining={timeRemaining}
        loading={loadingMissions}
      />
    </div>
  );
}
