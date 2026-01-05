import { useEffect, useState } from "react"
import { adminService } from "@/services/adminService"
import { User, UserInfo, UserUpdate, UserInfoUpdate, RoleType, RoleAssign } from "@/types/user"
import { AdminUserVM } from "@/types/AdminUserVM";

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUserVM[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async() => {
    setLoading(true);
    const { data } = await adminService.getUsers();

    const enriched : AdminUserVM[] = await Promise.all (
        data.map(async u => {
            const profile = await adminService.getUserProfileById(u.id);

            const roles: RoleType[] = (await adminService.getUserRoles(u.id)).data.roles;

            return {
                id: u.id,
                email: u.email || "",
                name: profile.data.full_name,
                roles,
                is_banned: u.is_banned,
                joined: u.created_at.slice(0, 10),
            }
        })
    )

    setUsers(enriched);
    setLoading(false);
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

  const assignRole = async (userId: number, {user_id, role_type} : RoleAssign) => {
    await adminService.assignRole(userId, {user_id, role_type})
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
