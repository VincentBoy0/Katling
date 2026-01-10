import { ReactNode } from "react";

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>}
          <div>
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="mb-6 border-b border-border">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50">
        {icon}
      </div>
      <p className="text-muted-foreground text-lg mb-2">{title}</p>
      {description && (
        <p className="text-muted-foreground/70 text-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Đang tải..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
      <p className="text-red-600 font-medium">Lỗi: {message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
