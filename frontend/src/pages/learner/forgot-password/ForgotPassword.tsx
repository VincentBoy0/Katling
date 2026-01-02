import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/config/firebase";
import { toast } from "sonner";

import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send password reset email using Firebase
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + "/login",
        handleCodeInApp: false,
      });

      toast.success("Email đã được gửi!", {
        description: `Vui lòng kiểm tra hộp thư ${email} để đặt lại mật khẩu.`,
      });

      // Navigate to login after showing success message
      // Keep loading state until navigation completes
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Password reset error:", err);

      // Handle specific Firebase errors
      if (err.code === "auth/user-not-found") {
        setError("Email này chưa được đăng ký.");
      } else if (err.code === "auth/invalid-email") {
        setError("Email không hợp lệ.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Quá nhiều yêu cầu. Vui lòng thử lại sau.");
      } else {
        setError("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.");
      }

      // Only stop loading on error
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-2 border-b-4 border-border rounded-3xl shadow-sm bg-card">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2 text-muted-foreground hover:bg-muted font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Button>

        <div className="text-center mb-8 flex flex-col items-center">
          {/* Hero Icon */}
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
            <LockKeyhole className="text-primary w-10 h-10" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Quên mật khẩu?
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Đừng lo, chuyện này xảy ra thường xuyên mà. <br />
            Nhập email để lấy lại mật khẩu nhé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-muted-foreground tracking-wider ml-1">
              Email đăng ký
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 rounded-xl border-2 border-border focus-visible:ring-0 focus-visible:border-primary font-medium text-lg bg-muted/20"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 text-sm font-bold p-3 rounded-xl flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-bold shadow-md active:translate-y-0 transition-all border-primary-foreground/20"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-dashed border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Bạn đã nhớ ra mật khẩu?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline ml-1"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
