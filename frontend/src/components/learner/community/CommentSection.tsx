import { useState } from "react";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommentSectionProps {
  onAddComment: (content: string) => void;
}

export function CommentSection({ onAddComment }: CommentSectionProps) {
  const [commentInput, setCommentInput] = useState("");

  const submitComment = () => {
    if (!commentInput.trim()) return;
    onAddComment(commentInput);
    setCommentInput("");
  };

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in fade-in slide-in-from-top-2">
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
