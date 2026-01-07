import { Link as LinkIcon } from "lucide-react";
import { Friend } from "@/types/friend";
import { getAvatarColor } from "@/lib/avatar";

interface FriendsSidebarProps {
  friends: Friend[];
  onFriendClick: (friend: Friend) => void;
  // onInviteClick: () => void;
}

export function FriendsSidebar({
  friends,
  onFriendClick,
}: // onInviteClick,
FriendsSidebarProps) {
  return (
    <div className="hidden lg:block lg:col-span-1 space-y-6">
      <div className="bg-card border-2 border-border rounded-2xl p-4 sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Bạn bè ({friends.length})</h2>
          {/* <button
            onClick={onInviteClick}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors group"
            title="Mời bạn bè"
          >
            <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </button> */}
        </div>
        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1 overscroll-contain scroll-smooth">
          {friends.map((friend) => (
            <div
              key={friend.user_id}
              onClick={() => onFriendClick(friend)}
              className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-secondary-foreground border border-border ${getAvatarColor(
                  friend.username
                )}`}
              >
                {friend.username.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm group-hover:text-primary transition-colors">
                  {friend.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  XP {friend.xp} • 🔥 {friend.streak}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
