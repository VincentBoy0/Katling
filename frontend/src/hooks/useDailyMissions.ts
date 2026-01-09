import { useState, useEffect } from "react";
import { toast } from "sonner";

import { missionService } from "@/services/missionService";
import type { DailyMissionOut } from "@/types/mission";

interface UseDailyMissionsOptions {
  onClaimSuccess?: (xpGained: number, totalXp: number) => void;
}

export function useDailyMissions(
  onClaimSuccess?: UseDailyMissionsOptions["onClaimSuccess"]
){
  const [missions, setMissions] = useState<DailyMissionOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("00:00:00");

    const updateTimeRemaining = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);

    const diff = Math.max(tomorrow.getTime() - now.getTime(), 0);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeRemaining(
      `${hours.toString().padStart(2, "0")}:` +
      `${minutes.toString().padStart(2, "0")}:` +
      `${seconds.toString().padStart(2, "0")}`
    );
  };

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const data = await missionService.getDailyMissions();
      setMissions(data.missions);
    } catch (error) {
      console.error("Error fetching missions:", error);
      toast.error("Không thể tải nhiệm vụ hàng ngày", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  const claimMission = async (missionId: number) => {
    try {
      setClaimingId(missionId);
      const result = await missionService.claimMission(missionId);

      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? { ...m, is_claimed: true, can_claim: false }
            : m
        )
      );

      if (onClaimSuccess) {
        onClaimSuccess(result.xp, result.total_xp);
      }
      toast.success("Nhận thưởng thành công!", {
        description: `Bạn đã nhận được +${result.xp} XP`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error claiming mission:", error);
      toast.error("Không thể nhận thưởng", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setClaimingId(null);
    }
  };

  useEffect(() => {
    fetchMissions();
    updateTimeRemaining();

    const timer = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    missions,
    loading,
    claimingId,
    timeRemaining,
    fetchMissions,
    claimMission,
  };
}
