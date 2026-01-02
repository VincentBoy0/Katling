import { api } from "@/lib/api"
import { User, UserInfo, UserInfoUpdate, UserUpdate } from "@/types/user"

import { api } from "@/lib/api"
import {
  User,
  UserInfo,
  UserInfoUpdate,
  UserUpdate
} from "@/types/user"

export const adminService = {
  // GET /admin/users
  getUsers(params?: { skip?: number; limit?: number }) {
    return api.get<User[]>("/admin/users", { params })
  },

  // GET /admin/users/{user_id}
  getUserById(user_id: number) {
    return api.get<User>(`/admin/users/${user_id}`)
  },

  // GET /admin/users/{user_id}/profile
  getUserProfileById(user_id: number) {
    return api.get<UserInfo>(`/admin/users/${user_id}/profile`)
  },

  // PATCH /admin/users/{user_id}
  updateUserById(user_id: number, data: UserUpdate) {
    return api.patch<User>(`/admin/users/${user_id}`, data)
  },

  // PATCH /admin/users/{user_id}/profile
  updateUserProfileById(user_id: number, data: UserInfoUpdate) {
    return api.patch<UserInfo>(`/admin/users/${user_id}/profile`, data)
  },

  // POST /admin/users/{user_id}/ban
  banUserById(user_id: number) {
    return api.post<void>(`/admin/users/${user_id}/ban`)
  },

  // POST /admin/users/{user_id}/unban
  unbanUserById(user_id: number) {
    return api.post<void>(`/admin/users/${user_id}/unban`)
  },

  // DELETE /admin/users/{user_id}
  deleteUserById(user_id: number) {
    return api.delete<void>(`/admin/users/${user_id}`)
  }
}
