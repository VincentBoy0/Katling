import { useState } from "react";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Comment {
  id: number;
  author: string;
  avatarColor: string;
  content: string;
  timestamp: string;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export function CommentSection({
  comments,
  onAddComment,
}: CommentSectionProps) {
  const [commentInput, setCommentInput] = useState("");

  const submitComment = () => {
    if (!commentInput.trim()) return;
    onAddComment(commentInput);
    setCommentInput("");
  };

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in fade-in slide-in-from-top-2">
      {comments.length > 0 ? (
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${comment.avatarColor}`}
              >
                {comment.author.charAt(0)}
              </div>
              <div className="flex-1 bg-muted/30 p-3 rounded-xl rounded-tl-none">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-sm">{comment.author}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {comment.timestamp}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          Chưa có bình luận nào.
        </p>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Viết bình luận..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitComment()}
          className="h-10 rounded-xl border-2"
        />
        <Button
          onClick={submitComment}
          size="icon"
          className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
