export type LeaderboardType = "xp" | "streak";
export type LeaderboardPeriod = "all" | "week" | "month";


export interface LeaderboardItem {
  rank: number;
  user_id: number;
  username: string;
  xp: number;
  streak: number;
  rank_change: number | null;
  is_me: boolean;
}

export type LeaderboardResponse = LeaderboardItem[];



export interface MyLeaderboardResponse {
  user_id: number;
  rank: number | null;
  xp: number;
  streak: number;
}
