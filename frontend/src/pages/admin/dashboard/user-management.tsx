"use client";

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
} from "lucide-react";
import { useState } from "react";

const users = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    roles: ["Learner"],
    status: "Active",
    joined: "2024-01-15",
    enrolledCourses: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael@example.com",
    roles: ["Moderator", "Learner"],
    status: "Active",
    joined: "2024-01-10",
    enrolledCourses: 8,
  },
  {
    id: 3,
    name: "Emma Williams",
    email: "emma@example.com",
    roles: ["Learner"],
    status: "Inactive",
    joined: "2024-02-01",
    enrolledCourses: 3,
  },
  {
    id: 4,
    name: "James Rodriguez",
    email: "james@example.com",
    roles: ["Admin", "Moderator"],
    status: "Active",
    joined: "2024-01-20",
    enrolledCourses: 0,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa@example.com",
    roles: ["Moderator"],
    status: "Active",
    joined: "2024-01-05",
    enrolledCourses: 2,
  },
];

const availableRoles = ["Learner", "Moderator", "Admin"];

const roleColors = {
  Learner: "bg-blue-500/20 text-blue-600 border border-blue-500/30",
  Moderator: "bg-purple-500/20 text-purple-600 border border-purple-500/30",
  Admin: "bg-red-500/20 text-red-600 border border-red-500/30",
};

const roleIcons = {
  Learner: BookOpen,
  Moderator: Shield,
  Admin: Shield,
};

function RoleTag({ role, onRemove }) {
  const Icon = roleIcons[role];
  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${roleColors[role]}`}
    >
      <Icon className="w-3 h-3" />
      {role}
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRoles, setEditingRoles] = useState({});
  const [userStatuses, setUserStatuses] = useState(
    Object.fromEntries(users.map((u) => [u.id, u.status]))
  );
  const [confirmingRoles, setConfirmingRoles] = useState<{
    [key: number]: boolean;
  }>({});

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRoleFilter === "all" ||
      user.roles.some(
        (role) => role.toLowerCase() === selectedRoleFilter.toLowerCase()
      );

    return matchesSearch && matchesRole;
  });

  const startEditingRoles = (user) => {
    setEditingUserId(user.id);
    setEditingRoles({ [user.id]: [...user.roles] });
  };

  const toggleRole = (userId, role) => {
    setEditingRoles((prev) => {
      const currentRoles = prev[userId] || [];
      const isSelected = currentRoles.includes(role);

      return {
        ...prev,
        [userId]: isSelected
          ? currentRoles.filter((r) => r !== role)
          : [...currentRoles, role],
      };
    });
  };

  const saveRoles = (userId) => {
    setConfirmingRoles((prev) => ({ ...prev, [userId]: true }));
    setTimeout(() => {
      setEditingUserId(null);
      setConfirmingRoles((prev) => ({ ...prev, [userId]: false }));
    }, 1500);
  };

  const toggleUserStatus = (userId) => {
    setUserStatuses((prev) => ({
      ...prev,
      [userId]: prev[userId] === "Active" ? "Inactive" : "Active",
    }));
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
                {role}
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
                                  {role}
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
                        userStatuses[user.id] === "Active"
                          ? "bg-green-500/20 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {userStatuses[user.id]}
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
                        onClick={() => toggleUserStatus(user.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title={`Deactivate user`}
                      >
                        {userStatuses[user.id] === "Active" ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
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
            {users.filter((u) => userStatuses[u.id] === "Active").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Moderators</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.roles.includes("Moderator")).length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Admins</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter((u) => u.roles.includes("Admin")).length}
          </p>
        </div>
      </div>
    </div>
  );
}
