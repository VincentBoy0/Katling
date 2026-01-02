import { useState, useEffect } from "react";
import { missionService, Mission } from "@/services/missionService";
import { toast } from "sonner";
import { Gift } from "lucide-react";

interface UseDailyMissionsReturn {
  missions: Mission[];
  loading: boolean;
  claimingId: number | null;
  timeRemaining: string;
  fetchMissions: () => Promise<void>;
  claimMission: (missionId: number) => Promise<void>;
}

/**
 * Custom hook to manage daily missions
 * Handles fetching, claiming, and time remaining calculations
 */
export function useDailyMissions(
  onClaimSuccess?: (xp: number, totalXp: number) => void
): UseDailyMissionsReturn {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("24h 00m");

  // Fetch missions on mount
  useEffect(() => {
    fetchMissions();
  }, []);

  // Calculate time remaining until midnight
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
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
    setClaimingId(missionId);
    try {
      const result = await missionService.claimMission(missionId);

      // Update mission state
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? { ...m, is_claimed: true, can_claim: false }
            : m
        )
      );

      // Call success callback
      if (onClaimSuccess) {
        onClaimSuccess(result.xp, result.total_xp);
      }

      // Show success toast
      toast.success("Nhận thưởng thành công!", {
        description: `Bạn đã nhận được +${result.xp} XP`,
        icon: <Gift className="w-5 h-5 text-green-600" />,
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

  return {
    missions,
    loading,
    claimingId,
    timeRemaining,
    fetchMissions,
    claimMission,
  };
}
