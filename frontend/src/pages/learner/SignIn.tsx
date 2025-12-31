import { Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

import { Button } from "@/components/learner/button";
import { Card } from "@/components/learner/card";
import { Input } from "@/components/learner/input";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import { useSignInForm } from "@/hooks/useAuthForm";

export default function SignIn() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
    handleOAuthLogin,
  } = useSignInForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-2">
          <Link to="/">
            <img
              src="/img/logo_with_name_under.png"
              alt="Logo"
              className="w-2/5 h-auto mx-auto"
            />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="abc@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <ErrorAlert message={error} />

          <Button
            type="submit"
            className="w-full font-bold shadow-sm"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="space-y-4">
          <OAuthButtons
            onGoogleClick={() => handleOAuthLogin("google")}
            onFacebookClick={() => handleOAuthLogin("facebook")}
            disabled={loading}
            mode="signin"
          />

          <div className="text-center text-sm text-muted-foreground">
            <Link
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <div className="mt-2 pt-6 border-t">
          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
