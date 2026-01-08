import { useState, useEffect } from "react";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { Comment } from "@/types/post";
import { postService } from "@/services/postService";
import { getAvatarColor } from "@/lib/avatar";

interface CommentSectionProps {
  postId: number;
  onAddComment: (content: string) => void;
}

export function CommentSection({ postId, onAddComment }: CommentSectionProps) {
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postService.getComments(postId);
      setComments(response.data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setError("Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!commentInput.trim()) return;
    try {
      await onAddComment(commentInput);
      setCommentInput("");
      // Refresh comments after adding a new one
      await fetchComments();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in fade-in slide-in-from-top-2">
      {/* Comment Input */}
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

      {/* Comments List */}
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive text-center py-2">
            {error}
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-2">
            Chưa có bình luận nào
          </div>
        )}

        {!loading && comments.map((comment) => {
          const avatarColor = getAvatarColor(comment.author_username || "User");
          return (
            <div
              key={comment.comment_id}
              className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-white shadow-sm shrink-0 ${avatarColor}`}
              >
                {(comment.author_username || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    {comment.author_username || "Unknown User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1 wrap-break-word">
                  {comment.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
