import { api } from "@/lib/api";
import { User } from "@/types/user"
import { UserInfo } from "@/types/user"
import { UserInfoUpdate } from "@/types/user";
import { UserPoints } from "@/types/user";
import { UserPointsUpdate } from "@/types/user";

export const userService = {
  /**
   * Get current user's basic info
   * GET /user/
   */
  getUser() {
    return api.get<User>("/user");
  },

  /**
   * Get user's detailed info (profile)
   * GET /user/info
   */
  getUserInfo() {
    return api.get<UserInfo>("/user/info");
  },

  /**
   * Update user's profile info
   * PATCH /user/info
   */
  updateUserInfo(data: UserInfoUpdate) {
    return api.patch<UserInfo>("/user/info", data);
  },

  /**
   * Get user's XP and streak
   * GET /user/point
   */
  getUserPoints() {
    return api.get<UserPoints>("/user/point");
  },

  /**
   * Update user's XP and streak
   * PATCH /user/point
   */
  updateUserPoints(data: UserPointsUpdate) {
    return api.patch<UserPoints>("/user/point", data);
  },
};