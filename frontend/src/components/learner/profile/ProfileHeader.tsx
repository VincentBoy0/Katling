import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Camera, Edit2, Lock } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    displayName?: string;
    email?: string;
    level?: number;
    exp?: number;
    streak?: number;
  } | null;
  previewImage: string | null;
  onAvatarClick: () => void;
  onEditName: () => void;
  onChangePassword: () => void;
}

export default function ProfileHeader({
  user,
  previewImage,
  onAvatarClick,
  onEditName,
  onChangePassword,
}: ProfileHeaderProps) {
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
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
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
          <p className="text-3xl font-black text-orange-500">{user?.streak}</p>
        </div>
      </div>
    </Card>
  );
}
