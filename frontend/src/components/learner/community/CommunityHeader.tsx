import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";

interface CommunityHeaderProps {
  onCreatePost: () => void;
  onFindFriends: () => void;
}

export function CommunityHeader({
  onCreatePost,
  onFindFriends,
}: CommunityHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Cộng đồng
        </h1>
        <p className="text-muted-foreground font-medium text-lg">
          Chia sẻ hành trình, kết nối đam mê.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <Button
          variant="outline"
          onClick={onFindFriends}
          className="border-2 font-bold h-10"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Tìm bạn
        </Button>
        <Button
          onClick={onCreatePost}
          className="font-bold shadow-md h-10 bg-primary hover:bg-primary/90 text-white border-primary-foreground/20 active:border-b-0 active:translate-y-1 transition-all"
        >
          <Plus className="w-5 h-5 mr-1" /> Đăng bài
        </Button>
      </div>
    </div>
  );
}
