"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"; // Nhớ cài sonner nếu chưa có

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      // Giả lập API đổi mật khẩu
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Đổi mật khẩu thành công!", {
        description: "Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.",
      });

      router.push("/signin");
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

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
            Hãy đặt một mật khẩu mạnh để bảo vệ tài khoản của bạn nhé.
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
                placeholder="Ít nhất 8 ký tự"
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
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xlfont-bold text-lg shadow-md active:border-b-0 active:translate-y-1 transition-all mt-4"
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
