import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { UserInfoProvider } from "@/context/user-info-context";
import { Settings } from "lucide-react";

// Custom hooks
import { useAvatarManager } from "@/hooks/useAvatarManager";
import { usePasswordChange } from "@/hooks/usePasswordChange";
import { useState } from "react";

// Import components
import AvatarDialog from "@/components/learner/profile/AvatarDialog";
import ChangePasswordDialog from "@/components/learner/profile/ChangePasswordDialog";
import DetailedStats from "@/components/learner/profile/DetailedStats";
import EditNameDialog from "@/components/learner/profile/EditNameDialog";
import ProfileHeader from "@/components/learner/profile/ProfileHeader";

function ProfilePageContent() {
  const { user } = useAuth();

  // Custom hooks for logic separation
  const avatarManager = useAvatarManager();
  const passwordChange = usePasswordChange();
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);

  const badges = [
    {
      icon: "⭐",
      name: "Khởi đầu",
      description: "Hoàn thành bài học đầu tiên",
      unlocked: true,
    },
    {
      icon: "🔥",
      name: "Chuỗi 7 ngày",
      description: "Duy trì chuỗi 7 ngày",
      unlocked: true,
    },
    {
      icon: "🎯",
      name: "Xạ thủ",
      description: "Đạt mục tiêu tháng",
      unlocked: true,
    },
    {
      icon: "📚",
      name: "Mọt sách",
      description: "Hoàn thành 10 bài học",
      unlocked: true,
    },
    {
      icon: "💬",
      name: "Giao lưu",
      description: "Viết bài viết đầu tiên",
      unlocked: true,
    },
    {
      icon: "👑",
      name: "Vua từ vựng",
      description: "Thuộc 100 từ vựng",
      unlocked: false,
    },
    {
      icon: "🦉",
      name: "Cú đêm",
      description: "Học sau 10 giờ tối",
      unlocked: false,
    },
    {
      icon: "⚡",
      name: "Thần tốc",
      description: "Hoàn thành bài học dưới 2 phút",
      unlocked: false,
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto min-h-screen">
      {/* 1. HEADER */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Hồ sơ cá nhân
          </h1>
          <p className="text-muted-foreground font-medium">
            Quản lý thông tin và thành tích của bạn.
          </p>
        </div>
        <Link to="/dashboard/settings">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </Link>
      </div>

      {/* Profile Header with Avatar */}
      <ProfileHeader
        savedAvatar={avatarManager.savedAvatar}
        onAvatarClick={avatarManager.openDialog}
        onEditName={() => setShowEditNameDialog(true)}
        onChangePassword={passwordChange.openDialog}
      />

      {/* Detailed Stats */}
      <DetailedStats />

      {/* Badges Collection
      <BadgeCollection badges={badges} /> */}

      {/* Dialogs */}
      <AvatarDialog
        open={avatarManager.showDialog}
        onOpenChange={(open) =>
          open ? avatarManager.openDialog() : avatarManager.closeDialog()
        }
        userName={user?.displayName}
        selectedAvatar={avatarManager.selectedAvatar}
        onSelectAvatar={avatarManager.handleSelectAvatar}
        onSave={avatarManager.handleSaveAvatar}
      />

      <EditNameDialog
        open={showEditNameDialog}
        onOpenChange={setShowEditNameDialog}
      />

      <ChangePasswordDialog
        open={passwordChange.showDialog}
        onOpenChange={(open) =>
          open ? passwordChange.openDialog() : passwordChange.closeDialog()
        }
        currentPassword={passwordChange.currentPassword}
        newPassword={passwordChange.newPassword}
        confirmPassword={passwordChange.confirmPassword}
        error={passwordChange.error}
        loading={passwordChange.loading}
        onCurrentPasswordChange={passwordChange.setCurrentPassword}
        onNewPasswordChange={passwordChange.setNewPassword}
        onConfirmPasswordChange={passwordChange.setConfirmPassword}
        onSubmit={passwordChange.handleSubmit}
        onCancel={passwordChange.closeDialog}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <UserInfoProvider>
      <ProfilePageContent />
    </UserInfoProvider>
  );
}
