import { useState } from "react";
import { toast } from "sonner";

export function useAvatarManager() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setSelectedAvatar("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setPreviewImage(null);
  };

  const handleSaveAvatar = async () => {
    try {
      // TODO: Implement actual avatar save logic to backend
      // await updateUserAvatar(selectedAvatar, previewImage);
      
      toast.success("Đổi ảnh đại diện thành công!");
      setShowDialog(false);
      setPreviewImage(null);
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
    setPreviewImage(null);
  };

  return {
    showDialog,
    selectedAvatar,
    previewImage,
    openDialog,
    closeDialog,
    handleFileChange,
    handleSelectAvatar,
    handleSaveAvatar,
  };
}
