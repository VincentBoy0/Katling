import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/config/firebase";
import { Card } from "@/components/learner/card";
import { Button } from "@/components/learner/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!oobCode) {
        setStatus("error");
        setErrorMessage("Mã xác minh không hợp lệ.");
        return;
      }

      try {
        // Apply the verification code from the email link
        await applyActionCode(auth, oobCode);

        // Reload the current user to update emailVerified status
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }

        setStatus("success");
        toast.success("Email đã được xác minh thành công!");

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (error: any) {
        console.error("Email verification error:", error);
        setStatus("error");

        // Handle specific error codes
        if (error.code === "auth/invalid-action-code") {
          setErrorMessage("Mã xác minh không hợp lệ hoặc đã hết hạn.");
        } else if (error.code === "auth/expired-action-code") {
          setErrorMessage(
            "Mã xác minh đã hết hạn. Vui lòng yêu cầu gửi lại email."
          );
        } else {
          setErrorMessage("Không thể xác minh email. Vui lòng thử lại.");
        }
      }
    };

    verifyEmail();
  }, [oobCode, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-2 border-b-4 border-border rounded-3xl shadow-sm bg-card text-center">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-200">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              Đang xác minh...
            </h1>
            <p className="text-muted-foreground font-medium">
              Vui lòng đợi trong giây lát.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              Xác minh thành công!
            </h1>
            <p className="text-muted-foreground font-medium mb-6">
              Email của bạn đã được xác minh. Đang chuyển hướng...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang chuyển hướng...</span>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              Xác minh thất bại
            </h1>
            <p className="text-muted-foreground font-medium mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full font-bold"
              >
                Đăng nhập
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/signup")}
                className="w-full font-bold"
              >
                Đăng ký lại
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
