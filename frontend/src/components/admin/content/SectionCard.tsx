import { ChevronRight, ChevronDown, FileText } from "lucide-react";
import { LessonSection } from "@/types/content";
import { format } from "date-fns";

interface SectionCardProps {
  section: LessonSection;
  isExpanded: boolean;
  onClick: () => void;
}

export function SectionCard({
  section,
  isExpanded,
  onClick,
}: SectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ml-16 ${
        isExpanded
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <FileText className="w-4 h-4 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {section.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(section.created_at), "dd/MM/yyyy")}
          </p>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>
    </button>
  );
}
