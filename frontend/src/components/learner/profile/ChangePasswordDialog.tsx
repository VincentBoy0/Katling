import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

// Password validation requirements
const passwordRequirements = [
  {
    id: "length",
    label: "Ít nhất 8 ký tự",
    test: (pwd: string) => pwd.length >= 8,
  },
  {
    id: "uppercase",
    label: "Có ít nhất 1 chữ hoa",
    test: (pwd: string) => /[A-Z]/.test(pwd),
  },
  {
    id: "lowercase",
    label: "Có ít nhất 1 chữ thường",
    test: (pwd: string) => /[a-z]/.test(pwd),
  },
  {
    id: "number",
    label: "Có ít nhất 1 số",
    test: (pwd: string) => /[0-9]/.test(pwd),
  },
];

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  error: string;
  loading: boolean;
  onCurrentPasswordChange: (password: string) => void;
  onNewPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function ChangePasswordDialog({
  open,
  onOpenChange,
  currentPassword,
  newPassword,
  confirmPassword,
  error,
  loading,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onCancel,
}: ChangePasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-border rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-foreground">
            Đổi mật khẩu
          </DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground">
            Nhập mật khẩu hiện tại và mật khẩu mới của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-muted-foreground">
              Mật khẩu hiện tại
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              required
              className="border-2 h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-muted-foreground">
              Mật khẩu mới
            </label>
            <Input
              type="password"
              placeholder="Ít nhất 8 ký tự"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              required
              className="border-2 h-11"
            />

            {/* Password Requirements */}
            {newPassword && (
              <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Yêu cầu mật khẩu:
                </p>
                {passwordRequirements.map((req) => {
                  const isValid = req.test(newPassword);
                  return (
                    <div key={req.id} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isValid
                            ? "bg-green-500/20 text-green-600"
                            : "bg-red-500/20 text-red-600"
                        }`}
                      >
                        {isValid ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isValid ? "text-green-600" : "text-muted-foreground"
                        }`}
                      >
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-muted-foreground">
              Nhập lại mật khẩu mới
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              required
              className="border-2 h-11"
            />

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2">
                {newPassword === confirmPassword ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Mật khẩu khớp</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Mật khẩu không khớp
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 text-sm font-bold p-3 rounded-xl flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex-1 font-bold"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 font-bold shadow-sm"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
