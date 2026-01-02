import { Switch } from "@/components/learner/switch";
import { LucideIcon } from "lucide-react";

interface SettingItemProps {
  icon: LucideIcon;
  iconColorClass: string;
  title: string;
  description: string;
  type?: "toggle" | "info";
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  infoText?: string;
  hasBorder?: boolean;
}

export default function SettingItem({
  icon: Icon,
  iconColorClass,
  title,
  description,
  type = "toggle",
  checked = false,
  onCheckedChange,
  infoText,
  hasBorder = false,
}: SettingItemProps) {
  return (
    <div
      className={`p-4 md:p-5 flex items-center justify-between ${
        hasBorder ? "border-b border-border" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColorClass}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {type === "toggle" && onCheckedChange && (
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      )}

      {type === "info" && infoText && (
        <span className="text-xs font-bold bg-muted px-2 py-1 rounded text-muted-foreground">
          {infoText}
        </span>
      )}
    </div>
  );
}
