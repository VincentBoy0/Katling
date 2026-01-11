import { ReactNode, useState } from "react";
import { ChevronRight, ChevronDown, MoreVertical } from "lucide-react";

// Content type color mapping
export const contentTypeColors = {
  topic: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  lesson: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-600",
    badge: "bg-green-100 text-green-700",
  },
  section: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-600",
    badge: "bg-purple-100 text-purple-700",
  },
  question: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
  },
};

// Status color mapping
export const statusColors = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600", label: "Nháp" },
  PENDING_REVIEW: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "Chờ duyệt",
  },
  APPROVED: { bg: "bg-green-100", text: "text-green-700", label: "Đã duyệt" },
  REJECTED: { bg: "bg-red-100", text: "text-red-700", label: "Từ chối" },
  PUBLISHED: { bg: "bg-blue-100", text: "text-blue-700", label: "Công khai" },
};

export type ContentType = keyof typeof contentTypeColors;
export type ContentStatus = keyof typeof statusColors;

interface ContentTreeItemProps {
  type: ContentType;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  status?: ContentStatus;
  badge?: string;
  level?: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  actions?: ReactNode;
  children?: ReactNode;
}

export function ContentTreeItem({
  type,
  icon,
  title,
  subtitle,
  status,
  badge,
  level = 0,
  isExpanded = false,
  hasChildren = false,
  onToggle,
  onClick,
  actions,
  children,
}: ContentTreeItemProps) {
  const [showActions, setShowActions] = useState(false);
  const colors = contentTypeColors[type];
  const statusColor = status ? statusColors[status] : null;

  return (
    <div>
      <div
        className={`group flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${
          level > 0 ? "ml-6" : ""
        }`}
        style={{ marginLeft: level > 0 ? `${level * 24}px` : undefined }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
            className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Icon */}
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <div className={colors.text}>{icon}</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">
              {title}
            </span>
            {badge && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${colors.badge}`}
              >
                {badge}
              </span>
            )}
            {statusColor && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${statusColor.bg} ${statusColor.text}`}
              >
                {statusColor.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div
            className={`flex items-center gap-1 transition-opacity ${
              showActions ? "opacity-100" : "opacity-0"
            }`}
          >
            {actions}
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && children && (
        <div className="border-l border-border/50 ml-4">{children}</div>
      )}
    </div>
  );
}

interface ContentCardProps {
  type: ContentType;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  status?: ContentStatus;
  badge?: string;
  meta?: { label: string; value: string | number }[];
  onClick?: () => void;
  actions?: ReactNode;
}

export function ContentCard({
  type,
  icon,
  title,
  subtitle,
  status,
  badge,
  meta,
  onClick,
  actions,
}: ContentCardProps) {
  const colors = contentTypeColors[type];
  const statusColor = status ? statusColors[status] : null;

  return (
    <div
      className={`group bg-card border ${colors.border} rounded-xl p-4 hover:shadow-md transition-all cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${colors.bg} shrink-0`}>
          <div className={colors.text}>{icon}</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            {badge && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${colors.badge}`}
              >
                {badge}
              </span>
            )}
            {statusColor && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${statusColor.bg} ${statusColor.text}`}
              >
                {statusColor.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
          {meta && meta.length > 0 && (
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {meta.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-muted-foreground/70">
                    {item.label}:
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: ReactNode;
  label?: string;
  variant?: "default" | "primary" | "danger";
  onClick?: (e: React.MouseEvent) => void;
}

export function ActionButton({
  icon,
  label,
  variant = "default",
  onClick,
}: ActionButtonProps) {
  const variantClasses = {
    default: "text-muted-foreground hover:text-foreground hover:bg-accent",
    primary: "text-primary hover:bg-primary/10",
    danger: "text-red-500 hover:bg-red-500/10",
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`p-2 rounded-lg transition-colors ${variantClasses[variant]}`}
      title={label}
    >
      {icon}
    </button>
  );
}

interface ActionMenuProps {
  items: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
  }[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 min-w-[150px]">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 hover:bg-accent transition-colors ${
                  item.variant === "danger" ? "text-red-500" : "text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
