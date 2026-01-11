import { Battery, Flame, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CurrentProgressCard from "@/components/learner/dashboard/CurrentProgressCard";
import DailyMissionsSection from "@/components/learner/dashboard/DailyMissionsSection";
import MotivationCard from "@/components/learner/dashboard/MotivationCard";
import StatCard from "@/components/learner/dashboard/StatCard";
import WelcomeHeader from "@/components/learner/dashboard/WelcomeHeader";

import { useDailyMissions } from "@/hooks/useDailyMissions";
import { useSummary } from "@/hooks/useSummary";
import { useTopics } from "@/hooks/useTopics";
import { useUserInfo } from "@/hooks/useUserInfo";

export default function Dashboard() {
  const { userInfo } = useUserInfo();
  const { summary, refetchSummary } = useSummary();
  const { topics, loading: loadingTopics } = useTopics();
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

  // Find the current topic (status = "current") or first available
  const currentTopic = topics.find((t) => t.status === "current") || null;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      {/* 1. WELCOME & CONTINUE LEARNING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WelcomeHeader userName={userInfo?.full_name || "Katlinger"} />

          <CurrentProgressCard
            currentTopic={currentTopic}
            loading={loadingTopics}
            onContinue={() => navigate("/dashboard/learn")}
          />
        </div>

        <div className="lg:col-span-1">
          <MotivationCard summary={summary} />
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
