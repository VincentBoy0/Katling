import { api } from "@/lib/api";
import { ClaimMissionResponse, DailyMissionsResponse } from "@/types/mission";

export const missionService = {

  async getDailyMissions(): Promise<DailyMissionsResponse> {
    const response = await api.get<DailyMissionsResponse>(`/daily-missions`);
    return response.data;
  },

  async claimMission(userDailyMissionId: number): Promise<ClaimMissionResponse> {
    const response = await api.post<ClaimMissionResponse>(
      `/daily-missions/${userDailyMissionId}/claim`
    );
    return response.data;
  },
};
