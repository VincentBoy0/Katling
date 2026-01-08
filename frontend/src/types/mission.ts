export interface DailyMissionOut {
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
  missions: DailyMissionOut[];
}

export interface ClaimMissionResponse {
  xp: number;
  total_xp: number;
}
