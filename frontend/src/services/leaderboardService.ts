import { api } from "@/lib/api";

export type RankChange = "up" | "down" | "same";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  value: number;
  rank_change: RankChange;
}

export interface LeaderboardResponse {
  level: LeaderboardEntry[];
  streak: LeaderboardEntry[];
  xp: LeaderboardEntry[];
}

export interface MyLeaderboardRank {
  level: { rank: number; value: number };
  streak: { rank: number; value: number };
  xp: { rank: number; value: number };
}

export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardResponse> {
    const res = await api.get("/leaderboard");
    return res.data;
  },

  async getMyRank(): Promise<MyLeaderboardRank> {
    const res = await api.get("/leaderboard/me");
    return res.data;
  },
};
