import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            trend === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend === "up" ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          {change}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}
