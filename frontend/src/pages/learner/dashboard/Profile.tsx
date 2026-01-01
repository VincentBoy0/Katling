import type React from "react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/config/firebase";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/learner/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import {
  Award,
  Calendar,
  Camera,
  Check,
  Edit2,
  Flame,
  Lock,
  Settings,
  Target,
  Trophy,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// Mock Data: Avatar mặc định
const PRESET_AVATARS = [
  {
    id: "cat",
    icon: "🐱",
    color: "bg-orange-100 text-orange-600 border-orange-200",
  },
  {
    id: "dog",
    icon: "🐶",
    color: "bg-yellow-100 text-yellow-600 border-yellow-200",
  },
  { id: "fox", icon: "🦊", color: "bg-red-100 text-red-600 border-red-200" },
  {
    id: "bear",
    icon: "🐻",
    color: "bg-amber-100 text-amber-600 border-amber-200",
  },
  {
    id: "panda",
    icon: "🐼",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  {
    id: "lion",
    icon: "🦁",
    color: "bg-yellow-200 text-yellow-700 border-yellow-300",
  },
  {
    id: "robot",
    icon: "🤖",
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  {
    id: "alien",
    icon: "👽",
    color: "bg-green-100 text-green-600 border-green-200",
  },
  {
    id: "ghost",
    icon: "👻",
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
  {
    id: "cool",
    icon: "😎",
    color: "bg-pink-100 text-pink-600 border-pink-200",
  },
];

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

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Dialog States
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);

  // Form States
  const [editName, setEditName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar States
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- AVATAR HANDLERS ---
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

  const handleSaveAvatar = () => {
    // Logic lưu avatar vào server sẽ ở đây
    // Ở đây mình chỉ giả lập hiển thị thông báo
    toast.success("Đổi ảnh đại diện thành công!");
    setShowAvatarDialog(false);
    // Reset
    setPreviewImage(null);
    setSelectedAvatar(null);
  };

  // --- EXISTING HANDLERS ---
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ displayName: editName });
    setShowEditDialog(false);
    toast.success("Đã cập nhật tên hiển thị");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validate password requirements
    const failedRequirements = passwordRequirements.filter(
      (req) => !req.test(newPassword)
    );
    if (failedRequirements.length > 0) {
      setPasswordError(
        "Mật khẩu không đáp ứng yêu cầu: " +
          failedRequirements.map((req) => req.label).join(", ")
      );
      toast.error("Mật khẩu không hợp lệ", {
        description: failedRequirements.map((req) => req.label).join(", "),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setPasswordLoading(true);

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

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordDialog(false);
    } catch (err: any) {
      console.error("Password change error:", err);

      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setPasswordError("Mật khẩu hiện tại không đúng");
        toast.error("Mật khẩu hiện tại không đúng", {
          description: "Vui lòng kiểm tra lại mật khẩu hiện tại của bạn.",
        });
      } else if (err.code === "auth/weak-password") {
        setPasswordError(
          "Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn."
        );
        toast.error("Mật khẩu quá yếu", {
          description: "Vui lòng chọn mật khẩu mạnh hơn.",
        });
      } else if (err.code === "auth/requires-recent-login") {
        setPasswordError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại."
        );
        toast.error("Phiên đăng nhập hết hạn", {
          description: "Vui lòng đăng xuất và đăng nhập lại.",
        });
      } else {
        setPasswordError("Có lỗi xảy ra. Vui lòng thử lại.");
        toast.error("Có lỗi xảy ra", {
          description: "Vui lòng thử lại sau.",
        });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

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

      {/* 2. MAIN PROFILE CARD */}
      <Card className="relative overflow-hidden border-2 border-border rounded-3xl p-6 md:p-8 bg-card shadow-sm">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 -z-10"></div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar Section */}
          <div
            className="relative group cursor-pointer"
            onClick={() => setShowAvatarDialog(true)}
          >
            {previewImage ? (
              // Nếu có ảnh preview (vừa upload xong nhưng chưa lưu, hoặc avatar hiện tại là ảnh)
              <img
                src={previewImage}
                alt="Avatar"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-lg"
              />
            ) : (
              // Default Initial Avatar
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-900 bg-primary flex items-center justify-center text-white text-6xl font-black shadow-lg">
                {user?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="absolute bottom-2 right-2 p-2.5 bg-white dark:bg-slate-800 text-foreground rounded-full border-2 border-border shadow-sm group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                {user?.displayName}
              </h2>
              <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                Tham gia tháng 12/2024
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email}
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(true)}
                className="font-bold border-2 h-10 hover:bg-muted"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Sửa tên
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
                className="font-bold border-2 h-10 hover:bg-muted"
              >
                <Lock className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t-2 border-dashed border-border">
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Cấp độ
            </p>
            <p className="text-3xl font-black text-primary">{user?.level}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Kinh nghiệm
            </p>
            <p className="text-3xl font-black text-emerald-500">{user?.exp}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Chuỗi
            </p>
            <p className="text-3xl font-black text-orange-500">
              {user?.streak}
            </p>
          </div>
        </div>
      </Card>

      {/* 3. DETAILED STATS (Giữ nguyên) */}
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Target className="w-6 h-6 text-primary" />
        Thống kê chi tiết
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak */}
        <Card className="p-5 flex items-center gap-4 border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600">
            <Flame className="w-7 h-7 fill-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-orange-700 dark:text-orange-500">
              {user?.streak} ngày
            </p>
            <p className="text-xs font-bold text-orange-600/70 uppercase">
              Chuỗi hiện tại
            </p>
          </div>
        </Card>
        {/* XP */}
        <Card className="p-5 flex items-center gap-4 border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
            <Zap className="w-7 h-7 fill-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-500">
              {user?.exp} XP
            </p>
            <p className="text-xs font-bold text-emerald-600/70 uppercase">
              Tổng kinh nghiệm
            </p>
          </div>
        </Card>
        {/* Rank */}
        <Card className="p-5 flex items-center gap-4 border-2 border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-2xl">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600">
            <Trophy className="w-7 h-7 fill-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-yellow-700 dark:text-yellow-500">
              Top 10
            </p>
            <p className="text-xs font-bold text-yellow-600/70 uppercase">
              Thứ hạng tuần
            </p>
          </div>
        </Card>
      </div>

      {/* 4. BADGES (Giữ nguyên) */}
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2 pt-4">
        <Award className="w-6 h-6 text-yellow-500" />
        Bộ sưu tập Huy hiệu ({badges.filter((b) => b.unlocked).length}/
        {badges.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {badges.map((badge, idx) => (
          <Card
            key={idx}
            className={`p-4 flex flex-col items-center text-center gap-3 border-2 rounded-2xl transition-all ${
              badge.unlocked
                ? "border-border bg-card hover:-translate-y-1 hover:shadow-md cursor-pointer"
                : "border-border/50 bg-muted/30 opacity-60"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-sm border-2 ${
                badge.unlocked
                  ? "bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-200"
                  : "bg-muted border-border grayscale"
              }`}
            >
              {badge.icon}
            </div>
            <div>
              <p
                className={`font-bold text-sm ${
                  badge.unlocked ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {badge.name}
              </p>
              {badge.unlocked ? (
                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Đã nhận
                </span>
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1 inline-block">
                  Khóa
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* --- DIALOG: CHANGE AVATAR (NEW) --- */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md border-2 border-border rounded-3xl p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-black text-foreground">
              Đổi ảnh đại diện
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Chọn ảnh đại diện thể hiện cá tính của bạn.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="presets" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl mb-6">
              <TabsTrigger value="presets" className="rounded-lg font-bold">
                Thư viện
              </TabsTrigger>
              <TabsTrigger value="upload" className="rounded-lg font-bold">
                Tải lên
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: PRESETS */}
            <TabsContent value="presets" className="space-y-6">
              <div className="grid grid-cols-5 gap-3">
                {/* Default User Letter */}
                <div
                  onClick={() => {
                    setSelectedAvatar("default");
                    setPreviewImage(null);
                  }}
                  className={`
                    aspect-square rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl cursor-pointer border-4 transition-all
                    ${
                      selectedAvatar === "default"
                        ? "border-primary ring-2 ring-primary ring-offset-2 scale-110"
                        : "border-transparent hover:scale-105"
                    }
                  `}
                >
                  {user?.displayName?.charAt(0).toUpperCase()}
                </div>

                {/* Preset List */}
                {PRESET_AVATARS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedAvatar(preset.id);
                      setPreviewImage(null);
                    }}
                    className={`
                      aspect-square rounded-full flex items-center justify-center text-2xl cursor-pointer border-4 transition-all
                      ${preset.color}
                      ${
                        selectedAvatar === preset.id
                          ? "border-current ring-2 ring-offset-2 ring-gray-300 scale-110"
                          : "border-transparent hover:scale-105"
                      }
                    `}
                  >
                    {preset.icon}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 2: UPLOAD */}
            <TabsContent value="upload" className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/30 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors gap-3 group"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-white group-hover:text-primary transition-colors">
                    <Upload className="w-8 h-8" />
                  </div>
                )}

                <p className="text-sm font-bold text-muted-foreground group-hover:text-primary">
                  {previewImage ? "Nhấn để thay đổi" : "Tải ảnh từ thiết bị"}
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => setShowAvatarDialog(false)}
              className="flex-1 font-bold"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveAvatar}
              disabled={!selectedAvatar && !previewImage}
              className="flex-1 font-bold shadow-md bg-primary hover:bg-primary/90 text-white"
            >
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- OTHER DIALOGS (Giữ nguyên) --- */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md border-2 border-border">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tên</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveName} className="space-y-4 pt-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="border-2"
            />
            <Button type="submit" className="w-full font-bold shadow-sm">
              Lưu
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md border-2 border-border rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground">
              Đổi mật khẩu
            </DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Nhập mật khẩu hiện tại và mật khẩu mới của bạn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-muted-foreground">
                Mật khẩu hiện tại
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="border-2 h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-muted-foreground">
                Mật khẩu mới
              </label>
              <Input
                type="password"
                placeholder="Ít nhất 8 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="border-2 h-11"
              />

              {/* Password Requirements */}
              {newPassword && (
                <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Yêu cầu mật khẩu:
                  </p>
                  {passwordRequirements.map((req) => {
                    const isValid = req.test(newPassword);
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

            <div className="space-y-2">
              <label className="block text-sm font-bold text-muted-foreground">
                Nhập lại mật khẩu mới
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-2 h-11"
              />

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2">
                  {newPassword === confirmPassword ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Mật khẩu khớp</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <X className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Mật khẩu không khớp
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {passwordError && (
              <div className="bg-red-50 border-2 border-red-100 text-red-600 text-sm font-bold p-3 rounded-xl flex items-center gap-2">
                <span className="shrink-0">⚠️</span>
                {passwordError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordError("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="flex-1 font-bold"
                disabled={passwordLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 font-bold shadow-sm"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
