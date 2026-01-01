import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/config/firebase";

import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Lock, Check, X } from "lucide-react";
import { toast } from "sonner";

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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState("");
  const oobCode = searchParams.get("oobCode");

  // Verify the password reset code when component mounts
  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        toast.error("Liên kết không hợp lệ", {
          description: "Vui lòng sử dụng liên kết từ email.",
        });
        navigate("/forgot-password");
        return;
      }

      try {
        // Verify the password reset code is valid
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
        setVerifying(false);
      } catch (err: any) {
        console.error("Verify code error:", err);

        if (err.code === "auth/expired-action-code") {
          toast.error("Liên kết đã hết hạn", {
            description: "Vui lòng yêu cầu đặt lại mật khẩu mới.",
          });
        } else if (err.code === "auth/invalid-action-code") {
          toast.error("Liên kết không hợp lệ", {
            description: "Liên kết đã được sử dụng hoặc không tồn tại.",
          });
        } else {
          toast.error("Có lỗi xảy ra", {
            description: "Vui lòng thử lại.",
          });
        }

        navigate("/forgot-password");
      }
    };

    verifyCode();
  }, [oobCode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oobCode) {
      toast.error("Liên kết không hợp lệ");
      return;
    }

    // Validate password requirements
    const failedRequirements = passwordRequirements.filter(
      (req) => !req.test(password)
    );
    if (failedRequirements.length > 0) {
      toast.error("Mật khẩu không đáp ứng yêu cầu", {
        description: failedRequirements.map((req) => req.label).join(", "),
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      // Confirm the password reset with Firebase
      await confirmPasswordReset(auth, oobCode, password);

      toast.success("Đổi mật khẩu thành công!", {
        description: "Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      if (err.code === "auth/expired-action-code") {
        toast.error("Liên kết đã hết hạn", {
          description: "Vui lòng yêu cầu đặt lại mật khẩu mới.",
        });
      } else if (err.code === "auth/invalid-action-code") {
        toast.error("Liên kết không hợp lệ");
      } else if (err.code === "auth/weak-password") {
        toast.error("Mật khẩu quá yếu", {
          description: "Vui lòng chọn mật khẩu mạnh hơn.",
        });
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 border-2 border-b-4 border-border rounded-3xl shadow-sm bg-card">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">
              Đang xác minh liên kết...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-2 border-b-4 border-border rounded-3xl shadow-sm bg-card animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Hero Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 border-2 border-green-200">
            <Lock className="text-green-600 w-10 h-10" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Mật khẩu mới
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Hãy đặt một mật khẩu mạnh để bảo vệ tài khoản{" "}
            <span className="font-bold text-foreground">{email}</span> nhé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mật khẩu mới */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-muted-foreground tracking-wider ml-1 uppercase">
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-12 rounded-xl border-2 border-border focus-visible:ring-0 focus-visible:border-primary font-medium text-lg bg-muted/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Yêu cầu mật khẩu:
                </p>
                {passwordRequirements.map((req) => {
                  const isValid = req.test(password);
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

          {/* Xác nhận mật khẩu */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-muted-foreground tracking-wider ml-1 uppercase">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-12 h-12 rounded-xl border-2 border-border focus-visible:ring-0 focus-visible:border-primary font-medium text-lg bg-muted/20"
                required
              />
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2">
                {password === confirmPassword ? (
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

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-bold text-lg shadow-md active:border-b-0 active:translate-y-1 transition-all mt-4"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">Hoàn tất</span>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
