import { api } from "@/lib/api";

// Types
export interface Mission {
  id: number;
  description: string;
  progress: number;
  target: number;
  xp: number;
  status: "in_progress" | "completed";
  is_claimed: boolean;
  can_claim: boolean;
}

export interface DailyMissionsResponse {
  date: string;
  missions: Mission[];
}

export interface ClaimMissionResponse {
  xp: number;
  total_xp: number;
}

// Service
export const missionService = {
  /**
   * Get daily missions for current user
   */
  async getDailyMissions(): Promise<DailyMissionsResponse> {
    const response = await api.get<DailyMissionsResponse>("/daily-missions");
    return response.data;
  },

  /**
   * Claim reward for a completed mission
   */
  async claimMission(missionId: number): Promise<ClaimMissionResponse> {
    const response = await api.post<ClaimMissionResponse>(
      `/daily-missions/${missionId}/claim`
    );
    return response.data;
  },
};
