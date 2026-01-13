import { useEffect, useState } from "react"
import { adminService } from "@/services/adminService"
import { User, UserInfo, UserUpdate, UserInfoUpdate, RoleType, RoleAssign } from "@/types/user"
import { AdminUserVM } from "@/types/AdminUserVM";

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUserVM[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async() => {
    setLoading(true);
    try {
      // Use the optimized enriched endpoint - solves N+1 query problem
      // This makes 2 queries instead of 1 + N*2 queries
      const { data } = await adminService.getUsersEnriched({ limit: 100 });

      const enriched: AdminUserVM[] = data.map(user => ({
        id: user.id,
        email: user.email || "",
        name: user.full_name || user.username || user.email?.split('@')[0] || "Unknown",
        roles: user.roles || [],
        is_banned: user.is_banned,
        joined: user.created_at.slice(0, 10),
      }));

      setUsers(enriched);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }

  // Update user
  const updateUser = async (id: number, payload: UserUpdate) => {
    const { data } = await adminService.updateUserById(id, payload)
    setUsers(u => u.map(x => x.id === id ? { ...x, email: data.email || "" } : x))
    return data
  }

  // Update profile
  const updateProfile = async (id: number, payload: UserInfoUpdate) => {
    const { data } = await adminService.updateUserProfileById(id, payload)
    setUsers(u => u.map(x => x.id === id ? { ...x, full_name: data.full_name } : x))
    return data
  }

  // Ban / unban
  const ban = async (id: number) => {
    await adminService.banUserById(id)
    setUsers(u => u.map(x => x.id === id ? { ...x, is_banned: true } : x))
  }

  const unban = async (id: number) => {
    await adminService.unbanUserById(id)
    setUsers(u => u.map(x => x.id === id ? { ...x, is_banned: false } : x))
  }

  // Delete
  const remove = async (id: number) => {
    await adminService.deleteUserById(id)
    setUsers(u => u.filter(x => x.id !== id))
  }

  const assignRole = async (userId: number, { role_type }: RoleAssign) => {
    await adminService.assignRole(userId, { role_type })
    setUsers(users =>
      users.map(u =>
        u.id === userId
          ? {
              ...u,
              roles: u.roles.includes(role_type)
                ? u.roles
                : [...u.roles, role_type],
            }
          : u
      )
    );
  }

  const removeRole = async (userId: number, roleType: RoleType) => {
    await adminService.removeRole(userId, roleType);
    setUsers(users =>
      users.map(u =>
        u.id === userId
          ? {
              ...u,
              roles: u.roles.filter(r => r !== roleType),
            }
          : u
      )
    );
  }

  useEffect(() => { loadUsers() }, [])

  return {
    users,
    loading,
    reload: loadUsers,
    updateUser,
    updateProfile,
    ban,
    unban,
    remove,
    assignRole,
    removeRole
  };
}
