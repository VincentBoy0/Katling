import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export function useProfileEdit() {
  const { user, updateUser } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || "");

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      updateUser({ displayName: editName });
      toast.success("Đã cập nhật tên hiển thị");
      setShowDialog(false);
    } catch (error) {
      toast.error("Không thể cập nhật tên", {
        description: "Vui lòng thử lại sau.",
      });
    }
  };

  const openDialog = () => {
    setEditName(user?.displayName || "");
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditName(user?.displayName || "");
  };

  return {
    showDialog,
    editName,
    setEditName,
    openDialog,
    closeDialog,
    handleSaveName,
  };
}
