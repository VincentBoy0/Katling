import { HelpCircle, Edit, Trash2, MoreVertical } from "lucide-react";
import { Question, QuestionType } from "@/types/content";
import {
  getQuestionTypeColor,
  getQuestionTypeLabel,
} from "./QuestionTypeColors";
import { statusColors } from "@/components/shared/ContentComponents";

interface QuestionCardProps {
  question: Question;
  isDropdownOpen: boolean;
  onToggleDropdown: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function QuestionCard({
  question,
  isDropdownOpen,
  onToggleDropdown,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const content = question.content || {};
  // MATCHING doesn't have a question field, use left items as preview
  const questionText =
    question.type === QuestionType.MATCHING
      ? content.left && content.left.length > 0
        ? `Match: ${content.left.join(", ")}`
        : "Matching question"
      : content.question ||
        content.text ||
        content.instruction ||
        content.sentence ||
        "";
  const typeColor = getQuestionTypeColor(question.type);
  const typeLabel = getQuestionTypeLabel(question.type);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeColor}`}
        >
          <HelpCircle className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${typeColor}`}
            >
              {typeLabel}
            </span>
            {question.status &&
              statusColors[question.status as keyof typeof statusColors] && (
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    statusColors[question.status as keyof typeof statusColors]
                      .bg
                  } ${
                    statusColors[question.status as keyof typeof statusColors]
                      .text
                  }`}
                >
                  {
                    statusColors[question.status as keyof typeof statusColors]
                      .label
                  }
                </span>
              )}
            <span className="text-xs text-muted-foreground">
              #{question.order_index + 1}
            </span>
          </div>

          <p className="text-foreground font-medium line-clamp-2 mb-2">
            {questionText || "(Không có nội dung)"}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Tạo: {formatDate(question.created_at)}</span>
            {question.audio_url && (
              <span className="text-blue-500">🎵 Có audio</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="relative dropdown-container shrink-0">
          <button
            onClick={onToggleDropdown}
            className="p-2 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg z-10 min-w-36 overflow-hidden">
              <button
                onClick={onEdit}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button
                onClick={onDelete}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
