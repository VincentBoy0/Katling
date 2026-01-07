import { Dialog, DialogContent } from "@/components/learner/dialog";
import { Card } from "@/components/ui/card";
import { Flame, Zap, Trophy } from "lucide-react";
import { Friend } from "@/types/friend";
import { getAvatarColor } from "@/lib/avatar";

interface FriendProfileDialogProps {
  friend: Friend | null;
  onOpenChange: (open: boolean) => void;
}

export function FriendProfileDialog({
  friend,
  onOpenChange,
}: FriendProfileDialogProps) {
  if (!friend) return null;

  return (
    <Dialog open={!!friend} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-transparent shadow-none">
        <Card className="w-full border-2 border-border rounded-3xl overflow-hidden bg-card">
          <div
            className={`h-24 w-full ${
              getAvatarColor(friend.username).split(" ")[0]
            } opacity-50 relative`}
          ></div>
          <div className="px-6 pb-6 -mt-10 flex flex-col items-center">
            <div
              className={`w-24 h-24 rounded-full border-4 border-card flex items-center justify-center text-3xl font-black shadow-sm ${getAvatarColor(
                friend.username
              )}`}
            >
              {friend.username.charAt(0)}
            </div>
            <div className="text-center mt-3 mb-4 space-y-1">
              <h2 className="text-2xl font-black text-foreground">
                {friend.username}
              </h2>
              {/* <p className="text-muted-foreground font-medium">
                {friend.username}
              </p> */}
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 w-full mb-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 text-center">
                <Zap className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-black text-blue-700">{friend.xp}</p>
                <p className="text-[10px] uppercase font-bold text-blue-600/70">
                  XP
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-black text-orange-700">
                  {friend.streak}
                </p>
                <p className="text-[10px] uppercase font-bold text-orange-600/70">
                  Streak
                </p>
              </div>
              {/* <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 text-center">
                <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-black text-yellow-700">
                  {friend.league}
                </p>
                <p className="text-[10px] uppercase font-bold text-yellow-600/70">
                  Hạng
                </p>
              </div> */}
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
