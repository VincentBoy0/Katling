import { useState } from "react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import { toast } from "sonner";

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

export function usePasswordChange() {
  const [showDialog, setShowDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (): boolean => {
    setError("");

    // Validate password requirements
    const failedRequirements = passwordRequirements.filter(
      (req) => !req.test(newPassword)
    );
    
    if (failedRequirements.length > 0) {
      const errorMsg = "Mật khẩu không đáp ứng yêu cầu: " + 
        failedRequirements.map((req) => req.label).join(", ");
      setError(errorMsg);
      toast.error("Mật khẩu không hợp lệ", {
        description: failedRequirements.map((req) => req.label).join(", "),
      });
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      toast.error("Mật khẩu xác nhận không khớp");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      toast.success("Đổi mật khẩu thành công!", {
        description: "Mật khẩu của bạn đã được cập nhật.",
      });

      // Reset form and close
      resetForm();
      setShowDialog(false);
    } catch (err: any) {
      console.error("Password change error:", err);

      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Mật khẩu hiện tại không đúng");
        toast.error("Mật khẩu hiện tại không đúng", {
          description: "Vui lòng kiểm tra lại mật khẩu hiện tại của bạn.",
        });
      } else if (err.code === "auth/weak-password") {
        setError("Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn.");
        toast.error("Mật khẩu quá yếu", {
          description: "Vui lòng chọn mật khẩu mạnh hơn.",
        });
      } else if (err.code === "auth/requires-recent-login") {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại.");
        toast.error("Phiên đăng nhập hết hạn", {
          description: "Vui lòng đăng xuất và đăng nhập lại.",
        });
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
        toast.error("Có lỗi xảy ra", {
          description: "Vui lòng thử lại sau.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const openDialog = () => setShowDialog(true);
  
  const closeDialog = () => {
    setShowDialog(false);
    resetForm();
  };

  return {
    showDialog,
    currentPassword,
    newPassword,
    confirmPassword,
    error,
    loading,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    openDialog,
    closeDialog,
    handleSubmit,
  };
}
