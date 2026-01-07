import { Check, X } from "lucide-react";
import { FriendRequest } from "@/types/friend";
import { getAvatarColor } from "@/lib/avatar";

interface FriendRequestsSidebarProps {
  requests: FriendRequest[];
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

export function FriendRequestsSidebar({
  requests,
  onAccept,
  onReject,
}: FriendRequestsSidebarProps) {
  return (
    <div className="hidden lg:block lg:col-span-1 space-y-6">
      <div className="bg-card border-2 border-border rounded-2xl p-4 sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">
            Lời mời kết bạn ({requests.length})
          </h2>
        </div>

        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1 overscroll-contain scroll-smooth">
          {requests.map((req) => {
            const name = req.sender_username || "Unknown";

            return (
              <div
                key={req.request_id}
                className="flex items-center justify-between p-2 rounded-xl border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-secondary-foreground border border-border ${getAvatarColor(
                      name
                    )}`}
                  >
                    {name.charAt(0)}
                  </div>
                  <span className="font-bold text-sm">{name}</span>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => onAccept(req.request_id)}
                    className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-white transition-colors"
                    title="Chấp nhận"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onReject(req.request_id)}
                    className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive hover:text-white transition-colors"
                    title="Từ chối"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {requests.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Không có lời mời nào.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
