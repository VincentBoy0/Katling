import { ChevronRight, ChevronDown, Folder } from "lucide-react";
import { Topic } from "@/types/content";
import { format } from "date-fns";

interface TopicCardProps {
  topic: Topic;
  isExpanded: boolean;
  onClick: () => void;
}

export function TopicCard({ topic, isExpanded, onClick }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isExpanded
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Folder className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {topic.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(topic.created_at), "dd/MM/yyyy")}
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
      {topic.description && isExpanded && (
        <p className="text-xs text-muted-foreground mt-2 ml-11">
          {topic.description}
        </p>
      )}
    </button>
  );
}
