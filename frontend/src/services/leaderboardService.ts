import { api } from "@/lib/api";
import {
  LeaderboardType,
  LeaderboardPeriod,
  LeaderboardResponse,
  MyLeaderboardResponse,
} from "@/types/leaderboard";


interface GetLeaderboardParams {
  type: LeaderboardType;
  period?: LeaderboardPeriod;
  limit?: number;
  offset?: number;
}

export const leaderboardService = {
  async getLeaderboard(
    params: GetLeaderboardParams
  ): Promise<LeaderboardResponse> {
    const response = await api.get<LeaderboardResponse>("/leaderboard", {
      params: {
        type: params.type,
        period: params.period ?? "all",
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      },
    });
    return response.data;

  },

  async getMyRank(
    type: LeaderboardType,
    period: LeaderboardPeriod = "all"
  ): Promise<MyLeaderboardResponse> {
    const response = await api.get<MyLeaderboardResponse>(
      "/leaderboard/me",
      {
        params: {
          type,
          period,
        },
      }
    );
    return response.data;
  },
};
