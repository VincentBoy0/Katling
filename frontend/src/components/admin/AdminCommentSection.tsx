import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Comment } from "@/types/post";
import { postService } from "@/services/postService";
import { adminService } from "@/services/adminService";
import { getAvatarColor } from "@/lib/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";

interface AdminCommentSectionProps {
  postId: number;
  onCommentDeleted?: () => void;
}

export function AdminCommentSection({
  postId,
  onCommentDeleted,
}: AdminCommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const openDeleteDialog = (commentId: number) => {
    setDeleteCommentId(commentId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteCommentId === null) return;

    setDeleting(true);
    try {
      await adminService.deleteComment(deleteCommentId, false);
      toast.success("Đã xóa bình luận");
      setComments((prev) =>
        prev.filter((c) => c.comment_id !== deleteCommentId)
      );
      onCommentDeleted?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Không thể xóa bình luận");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteCommentId(null);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in fade-in slide-in-from-top-2">
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

        {!loading &&
          comments.map((comment) => {
            const avatarColor = getAvatarColor(
              comment.author_username || "User"
            );
            return (
              <div
                key={comment.comment_id}
                className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
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
                  <p className="text-sm text-foreground mt-1 break-words">
                    {comment.content}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDeleteDialog(comment.comment_id)}
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Xác nhận xóa bình luận
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không
              thể hoàn tác.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              className="font-bold"
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="font-bold bg-red-500 text-white hover:bg-red-600"
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
