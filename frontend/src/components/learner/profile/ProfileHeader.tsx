import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserInfoContext } from "@/context/user-info-context";
import { useUser } from "@/hooks/useUser";
import { Calendar, Camera, Edit2, Lock } from "lucide-react";

interface ProfileHeaderProps {
  previewImage: string | null;
  onAvatarClick: () => void;
  onEditName: () => void;
  onChangePassword: () => void;
}

export default function ProfileHeader({
  previewImage,
  onAvatarClick,
  onEditName,
  onChangePassword,
}: ProfileHeaderProps) {
  const { user, loading } = useUser();
  const { userInfo } = useUserInfoContext();

  if (loading) return <p>Đang tải...</p>;
  if (!user || !userInfo) return null;

  const date = new Date(userInfo.created_at);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const joinDate = `${mm}/${yyyy}`;

  return (
    <Card className="relative overflow-hidden border-2 border-border rounded-3xl p-6 md:p-8 bg-card shadow-sm">
      <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 -z-10"></div>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
        {/* Avatar Section */}
        <div className="relative group cursor-pointer" onClick={onAvatarClick}>
          {previewImage ? (
            <img
              src={previewImage}
              alt="Avatar"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-900 bg-primary flex items-center justify-center text-white text-6xl font-black shadow-lg">
              {userInfo.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <div className="absolute bottom-2 right-2 p-2.5 bg-white dark:bg-slate-800 text-foreground rounded-full border-2 border-border shadow-sm group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              {userInfo.full_name || "User"}
            </h2>
            <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              Tham gia vào {joinDate}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Button
              variant="outline"
              onClick={onEditName}
              className="font-bold border-2 h-10 hover:bg-muted"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Sửa tên
            </Button>
            <Button
              variant="outline"
              onClick={onChangePassword}
              className="font-bold border-2 h-10 hover:bg-muted"
            >
              <Lock className="w-4 h-4 mr-2" />
              Đổi mật khẩu
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
