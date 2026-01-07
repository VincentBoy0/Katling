import { ReactNode } from "react";

interface StatusBadgeProps {
  status: string;
  variant?:
    | "default"
    | "draft"
    | "pending"
    | "published"
    | "archived"
    | "rejected"
    | "deleted";
}

const variantStyles = {
  default: "bg-gray-500/20 text-gray-600",
  draft: "bg-gray-500/20 text-gray-600",
  pending: "bg-yellow-500/20 text-yellow-600",
  published: "bg-green-500/20 text-green-600",
  archived: "bg-slate-500/20 text-slate-600",
  rejected: "bg-red-500/20 text-red-600",
  deleted: "bg-red-500/20 text-red-600",
};

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded font-semibold ${variantStyles[variant]}`}
    >
      {status}
    </span>
  );
}

interface TypeBadgeProps {
  type: string;
  color?: string;
}

export function TypeBadge({ type, color }: TypeBadgeProps) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded font-semibold ${
        color || "bg-blue-500/20 text-blue-600"
      }`}
    >
      {type}
    </span>
  );
}

interface BadgeGroupProps {
  children: ReactNode;
}

export function BadgeGroup({ children }: BadgeGroupProps) {
  return <div className="flex items-center gap-1.5 flex-wrap">{children}</div>;
}
