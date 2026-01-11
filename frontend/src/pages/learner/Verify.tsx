import type React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Card } from "@/components/learner/card";
import { Button } from "@/components/learner/button";
import { Mail, ArrowRight, Loader2, RotateCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export default function VerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const { isEmailVerified, resendVerificationEmail, isAuthenticated } =
    useAuth();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Check if email is verified and redirect
  useEffect(() => {
    if (isEmailVerified && isAuthenticated) {
      toast.success("Email đã được xác minh!", {
        description: "Chào mừng bạn đến với Katling.",
      });
      navigate("/dashboard");
    }
  }, [isEmailVerified, isAuthenticated, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      toast.success("Đã gửi lại email!", {
        description: "Vui lòng kiểm tra hộp thư của bạn.",
      });
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      toast.error("Không thể gửi email", {
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOpenEmail = () => {
    // Try to open email client
    window.open("https://mail.google.com", "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-2 border-b-4 border-border rounded-3xl shadow-sm bg-card text-center">
        {/* Icon Hero */}
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-indigo-200">
          <Mail className="w-10 h-10 text-indigo-600" />
        </div>

        <h1 className="text-3xl font-black text-foreground mb-2">
          Kiểm tra Email
        </h1>
        <p className="text-muted-foreground font-medium mb-4">
          Chúng tôi đã gửi link xác minh đến{" "}
          <span className="text-foreground font-bold">{email}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Nhấn vào link trong email để xác minh tài khoản của bạn.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleOpenEmail}
            className="w-full h-auto font-bold text-white shadow-md active:border-b-0 active:translate-y-1 transition-all"
          >
            <span className="flex items-center gap-2">
              Mở Email <ArrowRight className="w-5 h-5" />
            </span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={isResending || countdown > 0}
            className="w-full font-bold text-muted-foreground hover:text-primary"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4 mr-2" />
            )}
            {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại email"}
          </Button>
        </div>

        {/* Back to login */}
        <p className="mt-8 text-sm text-muted-foreground">
          Đã xác minh?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  );
}
