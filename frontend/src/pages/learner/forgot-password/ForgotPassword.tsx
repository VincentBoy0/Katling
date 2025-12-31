"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Link from "next/link";
import { Mail, ArrowLeft, LockKeyhole, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate sending verification email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowVerificationDialog(true);
    } catch (err) {
      setError("Không thể gửi email xác minh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Trong file app/forgot-password/page.tsx

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // --- THAY ĐỔI Ở ĐÂY ---
      // Thay vì alert xong về signin, ta chuyển sang trang reset
      router.push("/forgot-password/reset");
    } catch (err) {
      setError("Mã xác minh không đúng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-2 border-b-4 border-border rounded-3xl shadow-sm bg-card">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
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
            {loading ? "Đang gửi..." : "Gửi mã xác minh"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-dashed border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Bạn đã nhớ ra mật khẩu?{" "}
            <Link
              href="/signin"
              className="text-primary font-bold hover:underline ml-1"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </Card>

      {/* VERIFICATION DIALOG */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent className="sm:max-w-md border-2 border-border rounded-3xl p-6">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-200">
              <Mail className="text-emerald-600 w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-black text-foreground">
              Kiểm tra Email
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground pt-2">
              Chúng tôi đã gửi mã gồm 6 chữ số đến{" "}
              <span className="font-bold text-foreground">{email}</span>.
              <br />
              Nhập mã đó vào bên dưới.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerify} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase text-muted-foreground tracking-wider text-center">
                Mã xác minh
              </label>
              <div className="relative">
                <div className="flex justify-center mb-8">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot
                        index={0}
                        className="otp-slot w-12 h-14 text-2xl font-black border-2 border-border rounded-xl! 
bg-muted/20 focus:border-primary focus:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={1}
                        className="otp-slot w-12 h-14 text-2xl font-black border-2 border-border rounded-xl 
bg-muted/20 focus:border-primary focus:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={2}
                        className="otp-slot w-12 h-14 text-2xl font-black border-2 border-border rounded-xl 
bg-muted/20 focus:border-primary focus:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={3}
                        className="otp-slot w-12 h-14 text-2xl font-black border-2 border-border rounded-xl 
bg-muted/20 focus:border-primary focus:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={4}
                        className="otp-slot w-12 h-14 text-2xl font-black border-2 border-border rounded-xl 
bg-muted/20 focus:border-primary focus:ring-primary/20"
                      />
                      <InputOTPSlot
                        index={5}
                        className="otp-slot w-12 h-14 text-2xl font-black border-2 border-border rounded-xl! 
bg-muted/20 focus:border-primary focus:ring-primary/20"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-100 text-red-600 text-sm font-bold p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full font-bold shadow-md active:border-b-0 active:translate-y-1 transition-all"
                disabled={loading}
              >
                {loading ? "Đang kiểm tra..." : "Xác nhận"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full font-bold text-muted-foreground hover:text-primary"
                onClick={() => {
                  // Logic gửi lại mã
                  alert("Đã gửi lại mã!");
                }}
              >
                Gửi lại mã
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
