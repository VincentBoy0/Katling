import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              {item.icon}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  href?: string;
}

export function BackButton({
  label = "Quay lại",
  onClick,
  href,
}: BackButtonProps) {
  const className =
    "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4";

  if (href) {
    return (
      <Link to={href} className={className}>
        <ChevronRight className="w-4 h-4 rotate-180" />
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      <ChevronRight className="w-4 h-4 rotate-180" />
      {label}
    </button>
  );
}
