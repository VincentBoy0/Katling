import { Link } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";

import { Input } from "@/components/learner/input";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import { useSignUpForm } from "@/hooks/useAuthForm";

export default function SignUp() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    displayName,
    setDisplayName,
    error,
    loading,
    handleSubmit,
    handleOAuthSignup,
  } = useSignUpForm();

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
            <label className="block text-sm font-medium mb-2">
              Tên hiển thị
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nguyễn Văn A"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </form>

        <div className="space-y-4">
          <OAuthButtons
            onGoogleClick={() => handleOAuthSignup("google")}
            onFacebookClick={() => handleOAuthSignup("facebook")}
            disabled={loading}
            mode="signup"
          />
        </div>

        <div className="mt-2 pt-6 border-t">
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
