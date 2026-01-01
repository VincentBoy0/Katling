import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/learner/tabs";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

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
  previewImage: string | null;
  onSelectAvatar: (avatarId: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export default function AvatarDialog({
  open,
  onOpenChange,
  userName,
  selectedAvatar,
  previewImage,
  onSelectAvatar,
  onFileChange,
  onSave,
}: AvatarDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                onChange={onFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </TabsContent>
        </Tabs>

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
            disabled={!selectedAvatar && !previewImage}
            className="flex-1 font-bold shadow-md bg-primary hover:bg-primary/90 text-white"
          >
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
