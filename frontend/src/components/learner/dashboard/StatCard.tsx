import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  colorScheme: "orange" | "emerald" | "purple" | "blue" | "yellow";
}

const colorClasses = {
  orange: {
    card: "border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10",
    icon: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
    value: "text-orange-700 dark:text-orange-500",
    label: "text-orange-600/70",
  },
  emerald: {
    card: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10",
    icon: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
    value: "text-emerald-700 dark:text-emerald-500",
    label: "text-emerald-600/70",
  },
  purple: {
    card: "border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/10",
    icon: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    value: "text-purple-700 dark:text-purple-500",
    label: "text-purple-600/70",
  },
  blue: {
    card: "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10",
    icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    value: "text-blue-700 dark:text-blue-500",
    label: "text-blue-600/70",
  },
  yellow: {
    card: "border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-900/10",
    icon: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
    value: "text-yellow-700 dark:text-yellow-500",
    label: "text-yellow-600/70",
  },
};

export default function StatCard({
  icon: Icon,
  value,
  label,
  colorScheme,
}: StatCardProps) {
  const colors = colorClasses[colorScheme];

  return (
    <Card
      className={`p-4 flex flex-col items-center justify-center gap-2 border-2 ${colors.card} rounded-2xl hover:-translate-y-1 transition-transform cursor-default`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-center">
        <p className={`text-2xl font-black ${colors.value}`}>{value}</p>
        <p className={`text-xs font-bold ${colors.label} uppercase`}>{label}</p>
      </div>
    </Card>
  );
}
