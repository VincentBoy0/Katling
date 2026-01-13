import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Button } from "@/components/ui/button";

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

interface AvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  selectedAvatar: string | null;
  onSelectAvatar: (avatarId: string) => void;
  onSave: () => void;
}

export default function AvatarDialog({
  open,
  onOpenChange,
  userName,
  selectedAvatar,
  onSelectAvatar,
  onSave,
}: AvatarDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-border rounded-3xl p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-black text-foreground">
            Đổi ảnh đại diện
          </DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground">
            Chọn ảnh đại diện thể hiện cá tính của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <div className="grid grid-cols-5 gap-3">
            {/* Default User Letter */}
            <div
              onClick={() => onSelectAvatar("default")}
              className={`
                aspect-square rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl cursor-pointer border-4 transition-all
                ${
                  selectedAvatar === "default"
                    ? "border-primary ring-2 ring-primary ring-offset-2 scale-110"
                    : "border-transparent hover:scale-105"
                }
              `}
            >
              {userName?.charAt(0).toUpperCase()}
            </div>

            {/* Preset List */}
            {PRESET_AVATARS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onSelectAvatar(preset.id)}
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
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 font-bold"
          >
            Hủy
          </Button>
          <Button
            onClick={onSave}
            disabled={!selectedAvatar}
            className="flex-1 font-bold shadow-md bg-primary hover:bg-primary/90 text-white"
          >
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
