import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-card border border-border rounded-xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-hidden shadow-xl`}
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  variant?: "danger" | "warning" | "primary";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  isLoading = false,
  confirmDisabled = false,
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantClasses = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    primary: "bg-primary hover:opacity-90",
  };

  const buttonText =
    confirmText || (isLoading ? "Đang xử lý..." : confirmLabel);

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
          <div className="text-muted-foreground">{message}</div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading || confirmDisabled}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
            className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold ${variantClasses[variant]}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
