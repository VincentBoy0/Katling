import { api } from "@/lib/api"
import {
    RoleAssign,
    RoleType,
    User,
    UserInfo,
    UserInfoUpdate,
    UserRole,
    UserRoleCheck,
    UserRoleList,
    UserUpdate
} from "@/types/user"

export const adminService = {
    // GET /admin/users
    getUsers(params?: { skip?: number; limit?: number }) {
        return api.get<User[]>("/admin/users", { params })
    },

    // GET /admin/users/{userId}
    getUserById(userId: number) {
        return api.get<User>(`/admin/users/${userId}`)
    },

    // GET /admin/users/{userId}/profile
    getUserProfileById(userId: number) {
        return api.get<UserInfo>(`/admin/users/${userId}/profile`)
    },

    // PATCH /admin/users/{userId}
    updateUserById(userId: number, data: UserUpdate) {
        return api.patch<User>(`/admin/users/${userId}`, data)
    },

    // PATCH /admin/users/{userId}/profile
    updateUserProfileById(userId: number, data: UserInfoUpdate) {
        return api.patch<UserInfo>(`/admin/users/${userId}/profile`, data)
    },

    // POST /admin/users/{userId}/ban
    banUserById(userId: number) {
        return api.post<void>(`/admin/users/${userId}/ban`)
    },

    // POST /admin/users/{userId}/unban
    unbanUserById(userId: number) {
        return api.post<void>(`/admin/users/${userId}/unban`)
    },

    // DELETE /admin/users/{userId}
    deleteUserById(userId: number) {
        return api.delete<void>(`/admin/users/${userId}`)
    },

    assignRole(userId: number, { role_type }: RoleAssign) {
        return api.post<UserRole>(`/admin/users/${userId}/roles`, { role_type })
    },

    removeRole(userId: number, roleType: RoleType) {
        return api.delete<void>(`/admin/users/${userId}/roles/${roleType}`)
    },

    getUserRoles(userId: number) {
        return api.get<UserRoleList>(`/admin/users/${userId}/roles`)
    },

    checkUserRole(userId: number, roleType: RoleType) {
        return api.get<UserRoleCheck>(`/admin/users/${userId}/roles/${roleType}`)
    },
}
