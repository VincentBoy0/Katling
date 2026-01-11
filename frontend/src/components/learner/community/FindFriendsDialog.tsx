import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { UserSearchResult } from "@/types/friend";
import { getAvatarColor } from "@/lib/avatar";

// interface User {
//   id: number;
//   name: string;
//   username: string;
//   avatarColor: string;
//   isFriend: boolean;
// }

interface FindFriendsDialogProps {
  open: boolean;
  users: UserSearchResult[];
  onFindFriend: (query: string) => void;
  onOpenChange: (open: boolean) => void;
  onAddFriend: (userId: number) => void;
}

export function FindFriendsDialog({
  open,
  users,
  onFindFriend,
  onOpenChange,
  onAddFriend,
}: FindFriendsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onFindFriend(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (open) {
      onFindFriend(""); // load danh sách gợi ý ban đầu
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tìm bạn bè</DialogTitle>
          <DialogDescription>
            Tìm kiếm và kết nối với bạn bè mới
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nhập tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-9 border-2 font-medium"
            />
          </div>
          <Button
            size="sm"
            onClick={handleSearch}
            className="w-full bg-primary text-white font-bold"
          >
            Tìm
          </Button>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {users.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(
                      user.username || "U"
                    )}`}
                  >
                    {user.username?.charAt(0) || "?"}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">
                      {user.username || "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.username || "N/A"}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    console.log(
                      "Adding friend with ID:",
                      user.user_id,
                      "Type:",
                      typeof user.user_id
                    );
                    onAddFriend(user.user_id);
                  }}
                  disabled={
                    user.relationship_status === "REQUEST_SENT" ||
                    user.relationship_status === "FRIENDS"
                  }
                  className="h-8 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  {user.relationship_status === "REQUEST_SENT"
                    ? "Đã gửi"
                    : user.relationship_status === "FRIENDS"
                    ? "Bạn bè"
                    : "Thêm"}
                </Button>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Không tìm thấy kết quả.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
