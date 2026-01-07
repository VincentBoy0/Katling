import { ChevronRight, ChevronDown, LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { ReactNode } from "react";

interface ContentTreeItemProps {
  title: string;
  createdAt: string;
  icon: LucideIcon;
  iconColor: string;
  badges?: ReactNode;
  description?: string;
  isExpanded: boolean;
  onClick: () => void;
  level?: number;
  children?: ReactNode;
  actions?: ReactNode;
}

export function ContentTreeItem({
  title,
  createdAt,
  icon: Icon,
  iconColor,
  badges,
  description,
  isExpanded,
  onClick,
  level = 0,
  children,
  actions,
}: ContentTreeItemProps) {
  const indentClass = level === 0 ? "" : `ml-${level * 6}`;
  const borderLeftClass = level > 0 ? "border-l-2 border-muted pl-4" : "";

  return (
    <div className={level > 0 ? `ml-6 ${borderLeftClass}` : ""}>
      <button
        onClick={onClick}
        className={`w-full text-left p-3 rounded-lg border transition-all ${
          isExpanded
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-1.5 ${iconColor} rounded-lg shrink-0 mt-0.5`}>
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {badges}
            </div>

            <p className="font-medium text-foreground text-sm truncate mb-0.5">
              {title}
            </p>

            {description && isExpanded && (
              <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">
                {description}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              {format(new Date(createdAt), "dd MMM yyyy, HH:mm")}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {actions}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && children && (
        <div className="mt-2 space-y-2">{children}</div>
      )}
    </div>
  );
}
