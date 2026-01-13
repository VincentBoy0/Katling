import { Link } from "react-router-dom";
import { Lock, Mail, User, Check, X } from "lucide-react";

import { Input } from "@/components/learner/input";
import { Card } from "@/components/learner/card";
import { Button } from "@/components/learner/button";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import { useSignUpForm } from "@/hooks/useAuthForm";

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

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-3">
                {password === confirmPassword ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center bg-green-500/20">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium">Mật khẩu khớp</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-500/20">
                      <X className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium">
                      Mật khẩu không khớp
                    </span>
                  </div>
                )}
              </div>
            )}
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
