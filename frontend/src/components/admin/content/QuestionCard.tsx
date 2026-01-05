import {
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Trash2,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { Question } from "@/types/learning";
import { format } from "date-fns";
import { useState } from "react";

interface QuestionCardProps {
  question: Question & { is_deleted?: boolean };
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}

const typeColors: Record<string, string> = {
  MULTIPLE_CHOICE: "bg-blue-500/20 text-blue-600",
  MULTIPLE_SELECT: "bg-green-500/20 text-green-600",
  FILL_IN_THE_BLANK: "bg-purple-500/20 text-purple-600",
  MATCHING: "bg-orange-500/20 text-orange-600",
  TRANSCRIPT: "bg-pink-500/20 text-pink-600",
  ARRANGE_WORDS: "bg-indigo-500/20 text-indigo-600",
};

export function QuestionCard({
  question,
  onDelete,
  onRestore,
}: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="ml-24">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
          isExpanded
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        } ${question.is_deleted ? "opacity-50" : ""}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  typeColors[question.type] || "bg-gray-500/20 text-gray-600"
                }`}
              >
                {question.type}
              </span>
              {question.is_deleted && (
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-red-500/20 text-red-600">
                  DELETED
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(question.created_at), "dd/MM/yyyy HH:mm")}
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

      {isExpanded && (
        <div className="mt-2 p-4 bg-card border-2 border-border rounded-lg space-y-4">
          {/* Content */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">
              Content
            </p>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                {JSON.stringify(question.content, null, 2)}
              </pre>
            </div>
          </div>

          {/* Audio URL */}
          {question.audio_url && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                <Volume2 className="w-3 h-3" />
                Audio URL
              </p>
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-blue-600 break-all">
                  {question.audio_url}
                </p>
              </div>
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">
                Explanation
              </p>
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-foreground">
                  {question.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">
                Order Index
              </p>
              <p className="text-xs text-muted-foreground">
                {question.order_index}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">
                Question ID
              </p>
              <p className="text-xs text-muted-foreground">{question.id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            {question.is_deleted ? (
              <button
                onClick={() => onRestore(question.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg font-medium transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Restore
              </button>
            ) : (
              <button
                onClick={() => onDelete(question.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg font-medium transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
