import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Handler for Firebase auth action links
 * Redirects to appropriate pages based on mode parameter
 */
export default function ActionHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    if (!mode || !oobCode) {
      // Invalid link, redirect to login
      navigate("/login");
      return;
    }

    switch (mode) {
      case "resetPassword":
        // Redirect to reset password page with oobCode
        navigate(`/forgot-password/reset?oobCode=${oobCode}`);
        break;

      case "verifyEmail":
        // Handle email verification (nếu cần)
        navigate(`/verify-email?oobCode=${oobCode}`);
        break;

      default:
        navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-2 border-b-4 border-border rounded-3xl shadow-sm bg-card">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Đang chuyển hướng...
          </p>
        </div>
      </Card>
    </div>
  );
}
