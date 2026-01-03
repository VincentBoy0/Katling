import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";

interface User {
  id: number;
  name: string;
  username: string;
  avatarColor: string;
  isFriend: boolean;
}

interface FindFriendsDialogProps {
  open: boolean;
  users: User[];
  onOpenChange: (open: boolean) => void;
  onAddFriend: (userId: number) => void;
}

export function FindFriendsDialog({
  open,
  users,
  onOpenChange,
  onAddFriend,
}: FindFriendsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      !u.isFriend && u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tìm bạn bè</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nhập tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-2 font-medium"
            />
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.avatarColor}`}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.username}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onAddFriend(user.id)}
                  className="h-8 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-1" /> Thêm
                </Button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
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
