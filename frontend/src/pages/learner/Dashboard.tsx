import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Flame, Target, Trophy, Zap } from "lucide-react";

// Components
import WelcomeHeader from "@/components/learner/dashboard/WelcomeHeader";
import ContinueLearningCard from "@/components/learner/dashboard/ContinueLearningCard";
import EventBanner from "@/components/learner/dashboard/EventBanner";
import StatCard from "@/components/learner/dashboard/StatCard";
import DailyMissionsSection from "@/components/learner/dashboard/DailyMissionsSection";

// Hooks
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUserPoints } from "@/hooks/useUserPoints";
import { useDailyMissions } from "@/hooks/useDailyMissions";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const { userInfo } = useUserInfo();
  const { userPoints, refetchUserPoints } = useUserPoints();
  const navigate = useNavigate();

  // Use custom hook for daily missions
  const {
    missions,
    loading: loadingMissions,
    claimingId,
    timeRemaining,
    claimMission,
  } = useDailyMissions((xp, totalXp) => {
    // Callback when claim success
    updateUser({ exp: totalXp });

    // Refetch user points if function exists
    if (refetchUserPoints) {
      refetchUserPoints();
    }
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
