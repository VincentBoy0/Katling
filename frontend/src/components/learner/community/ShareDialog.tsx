import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Copy, Facebook, Mail, Send, Linkedin, Twitter } from "lucide-react";

interface SharePlatform {
  name: string;
  icon: React.ElementType;
  color: string;
  border: string;
}

const SHARE_PLATFORMS: SharePlatform[] = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600 text-white",
    border: "border-blue-700",
  },
  {
    name: "Twitter",
    icon: Twitter,
    color: "bg-black text-white",
    border: "border-gray-800",
  },
  {
    name: "Email",
    icon: Mail,
    color: "bg-gray-500 text-white",
    border: "border-gray-600",
  },
  {
    name: "Telegram",
    icon: Send,
    color: "bg-sky-500 text-white",
    border: "border-sky-600",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700 text-white",
    border: "border-blue-800",
  },
];

interface ShareDialogProps {
  open: boolean;
  shareLink: string;
  onOpenChange: (open: boolean) => void;
  onCopyLink: () => void;
  onPlatformClick: (platform: string) => void;
}

export function ShareDialog({
  open,
  shareLink,
  onOpenChange,
  onCopyLink,
  onPlatformClick,
}: ShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-border rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-center">
            Chia sẻ
          </DialogTitle>
          <DialogDescription className="text-center font-medium">
            Mời bạn bè cùng học hoặc chia sẻ bài viết thú vị!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-4 gap-4 px-2">
            {SHARE_PLATFORMS.map((platform) => (
              <div
                key={platform.name}
                className="flex flex-col items-center gap-2 group cursor-pointer"
                onClick={() => onPlatformClick(platform.name)}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 hover:scale-105 ${platform.color} ${platform.border}`}
                >
                  <platform.icon className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors text-center">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-muted/40 p-1.5 rounded-2xl border-2 border-border flex items-center gap-2">
            <Input
              value={shareLink}
              readOnly
              className="border-none bg-transparent focus-visible:ring-0 font-medium text-muted-foreground h-10"
            />
            <Button
              onClick={onCopyLink}
              className="h-10 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-sm shrink-0"
            >
              <Copy className="w-4 h-4 mr-2" /> Sao chép
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
