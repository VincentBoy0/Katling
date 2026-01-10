import { X } from "lucide-react";
import { QuestionType } from "@/types/content";
import { QuestionFormData, resetFormDataForType } from "./QuestionFormUtils";
import { QuestionEditor } from "./QuestionEditor";
import { getQuestionTypeLabel } from "./QuestionTypeColors";

interface QuestionModalProps {
  isOpen: boolean;
  title: string;
  formData: QuestionFormData;
  setFormData: (data: QuestionFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function QuestionModal({
  isOpen,
  title,
  formData,
  setFormData,
  onClose,
  onSubmit,
  isSubmitting,
  submitLabel,
}: QuestionModalProps) {
  if (!isOpen) return null;

  const handleTypeChange = (newType: QuestionType) => {
    setFormData(resetFormDataForType(formData, newType));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="overflow-y-auto max-h-[calc(90vh-130px)]"
        >
          <div className="p-6 space-y-5">
            {/* Question Type */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Loại câu hỏi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as QuestionType)
                }
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                required
              >
                {Object.values(QuestionType).map((type) => (
                  <option key={type} value={type}>
                    {getQuestionTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Editor */}
            <QuestionEditor
              formData={formData}
              setFormData={setFormData}
              audioUrl={formData.audio_url}
              setAudioUrl={(url) =>
                setFormData({ ...formData, audio_url: url })
              }
            />

            {/* Explanation */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Giải thích (tùy chọn)
              </label>
              <textarea
                value={formData.explanation || ""}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                placeholder="Giải thích tại sao đáp án đúng..."
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                rows={3}
              />
            </div>

            {/* Audio URL - only show for non-TRANSCRIPT types */}
            {formData.type !== QuestionType.TRANSCRIPT && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  URL Audio (tùy chọn)
                </label>
                <input
                  type="url"
                  value={formData.audio_url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, audio_url: e.target.value })
                  }
                  placeholder="https://example.com/audio.mp3"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  maxLength={512}
                />
              </div>
            )}

            {/* Order Index */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_index: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold"
            >
              {isSubmitting ? "Đang xử lý..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-semibold"
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
