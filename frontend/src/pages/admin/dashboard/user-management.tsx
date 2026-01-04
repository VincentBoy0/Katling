import { useAdminUsers } from "@/hooks/useAdminUsers";
import {
  Search,
  Edit2,
  X,
  Plus,
  Check,
  ToggleLeft,
  ToggleRight,
  Shield,
  BookOpen,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { RoleType } from "@/types/user";
import { AdminUserVM } from "@/types/AdminUserVM";

const roleColors: Record<RoleType, string> = {
  [RoleType.LEARNER]: "bg-blue-500/20 text-blue-600 border border-blue-500/30",
  [RoleType.MODERATOR]:
    "bg-purple-500/20 text-purple-600 border border-purple-500/30",
  [RoleType.ADMIN]: "bg-red-500/20 text-red-600 border border-red-500/30",
};

const roleIcons: Record<RoleType, typeof BookOpen> = {
  [RoleType.LEARNER]: BookOpen,
  [RoleType.MODERATOR]: Shield,
  [RoleType.ADMIN]: Shield,
};

const availableRoles = Object.values(RoleType);

const roleLabel = (role: RoleType) =>
  role.charAt(0) + role.slice(1).toLowerCase();

function RoleTag({
  role,
  onRemove,
}: {
  role: RoleType;
  onRemove?: () => void;
}) {
  const Icon = roleIcons[role];
  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${roleColors[role]}`}
    >
      <Icon className="w-3 h-3" />
      {roleLabel(role)}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity ml-1"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function UserManagement() {
  const {
    users,
    loading,
    reload: loadUsers,
    updateUser,
    updateProfile,
    ban,
    unban,
    remove,
    assignRole,
    removeRole,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRoles, setEditingRoles] = useState<{
    [key: number]: RoleType[];
  }>({});
  const [confirmingRoles, setConfirmingRoles] = useState<{
    [key: number]: boolean;
  }>({});

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRoleFilter === "all" ||
      user.roles.includes(selectedRoleFilter as RoleType);

    return matchesSearch && matchesRole;
  });

  const startEditingRoles = (user: AdminUserVM) => {
    setEditingUserId(user.id);
    setEditingRoles({ [user.id]: [...user.roles] });
  };

  const toggleRole = (userId: number, role: RoleType) => {
    setEditingRoles((prev) => {
      const currentRoles = prev[userId] || [];
      const isSelected = currentRoles.includes(role);

      return {
        ...prev,
        [userId]: isSelected
          ? currentRoles.filter((r: RoleType) => r !== role)
          : [...currentRoles, role],
      };
    });
  };

  const saveRoles = async (userId: number) => {
    const oldRoles = users.find((u) => u.id === userId)?.roles || [];
    const newRoles = editingRoles[userId] || [];

    const toAdd = newRoles.filter((r) => !oldRoles.includes(r));
    const toRemove = oldRoles.filter((r) => !newRoles.includes(r));

    setConfirmingRoles((prev) => ({ ...prev, [userId]: true }));

    try {
      // Add
      await Promise.all(
        toAdd.map((role) =>
          assignRole(userId, { user_id: userId, role_type: role })
        )
      );

      // Remove
      await Promise.all(toRemove.map((role) => removeRole(userId, role)));

      setEditingUserId(null);
    } finally {
      setConfirmingRoles((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          User Management
        </h2>
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSelectedRoleFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRoleFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Users
            </button>
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRoleFilter === role
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {roleLabel(role)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Roles
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {editingUserId === user.id ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {editingRoles[user.id]?.map((role) => (
                            <RoleTag
                              key={role}
                              role={role}
                              onRemove={() => toggleRole(user.id, role)}
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 bg-muted/30 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground w-full mb-1 font-medium">
                            Add more roles:
                          </p>
                          {availableRoles.map(
                            (role) =>
                              !editingRoles[user.id]?.includes(role) && (
                                <button
                                  key={role}
                                  onClick={() => toggleRole(user.id, role)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors font-semibold border border-primary/30"
                                >
                                  <Plus className="w-3 h-3" />
                                  {roleLabel(role)}
                                </button>
                              )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                          <RoleTag key={role} role={role} />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        user.is_banned
                          ? "bg-muted text-muted-foreground"
                          : "bg-green-500/20 text-green-600"
                      }`}
                    >
                      {user.is_banned ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {editingUserId === user.id ? (
                        <button
                          onClick={() => saveRoles(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            confirmingRoles[user.id]
                              ? "bg-green-500/20 text-green-600"
                              : "hover:bg-green-500/10 text-green-600"
                          }`}
                          title="Save roles"
                        >
                          <Check
                            className={`w-4 h-4 ${
                              confirmingRoles[user.id] ? "animate-pulse" : ""
                            }`}
                          />
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditingRoles(user)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Edit roles"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          user.is_banned ? unban(user.id) : ban(user.id)
                        }
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        {user.is_banned ? (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete user ${user.email}?`)) {
                            remove(user.id);
                          }
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => !u.is_banned).length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Moderators</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.roles.includes(RoleType.MODERATOR)).length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Admins</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter((u) => u.roles.includes(RoleType.ADMIN)).length}
          </p>
        </div>
      </div>
    </div>
  );
}
