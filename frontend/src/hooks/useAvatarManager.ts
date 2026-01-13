import { useEffect, useState } from "react";
import { toast } from "sonner";

const AVATAR_STORAGE_KEY = "katling_user_avatar";

export interface SavedAvatar {
  type: "preset";
  value: string; // preset id
}

export function useAvatarManager() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [savedAvatar, setSavedAvatar] = useState<SavedAvatar | null>(null);

  // Load saved avatar from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SavedAvatar;
        setSavedAvatar(parsed);
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleSaveAvatar = async () => {
    try {
      if (!selectedAvatar) return;

      const newAvatar: SavedAvatar = { type: "preset", value: selectedAvatar };

      // Save to localStorage
      localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(newAvatar));
      setSavedAvatar(newAvatar);

      toast.success("Đổi ảnh đại diện thành công!", {
        duration: 2000,
        dismissible: true,
      });
      setShowDialog(false);
      setSelectedAvatar(null);
    } catch (error) {
      toast.error("Không thể cập nhật ảnh đại diện", {
        description: "Vui lòng thử lại sau.",
      });
    }
  };

  const openDialog = () => setShowDialog(true);
  const closeDialog = () => {
    setShowDialog(false);
    setSelectedAvatar(null);
  };

  return {
    showDialog,
    selectedAvatar,
    savedAvatar,
    openDialog,
    closeDialog,
    handleSelectAvatar,
    handleSaveAvatar,
  };
}
