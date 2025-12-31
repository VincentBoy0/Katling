import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/learner/input-otp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2, Mail, RotateCw } from "lucide-react";
import { toast } from "sonner"; // Nhớ cài Toaster ở layout gốc

export default function VerifyPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 6) return;

    setIsLoading(true);
    // Giả lập call API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Xác minh thành công!", {
      description: "Chào mừng bạn đến với Katling.",
    });

    // Chuyển sang trang điền thông tin bổ sung
    navigate("/onboarding");
  };

  const handleResend = () => {
    toast.info("Đã gửi lại mã", {
      description: "Vui lòng kiểm tra hộp thư của bạn.",
    });
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
        <p className="text-muted-foreground font-medium mb-8">
          Chúng tôi đã gửi mã xác minh gồm 6 số đến{" "}
          <span className="text-foreground font-bold">user@example.com</span>
        </p>

        {/* Input OTP */}
        <div className="flex justify-center mb-8">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup className="gap-2 rounded-none">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="w-12 h-14 text-2xl font-black border-2 border-border rounded-xl! focus:border-primary focus:ring-primary/20 bg-muted/20"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleVerify}
            disabled={otp.length < 6 || isLoading}
            className="w-full h-auto font-bol text-white shadow-md active:border-b-0 active:translate-y-1 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Xác minh ngay <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleResend}
            className="w-full font-bold text-muted-foreground hover:text-primary"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Gửi lại mã
          </Button>
        </div>
      </Card>
    </div>
  );
}
