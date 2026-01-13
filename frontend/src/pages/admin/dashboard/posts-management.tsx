import {
  Search,
  Trash2,
  Heart,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AdminPostListItem } from "@/types/post";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { AdminCommentSection } from "@/components/admin/AdminCommentSection";
import { getAvatarColor } from "@/lib/avatar";

export default function PostsManagement() {
  const [posts, setPosts] = useState<AdminPostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  );

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getPosts({ skip: 0, limit: 100 });
      setPosts(response.data.posts);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Không thể tải danh sách bài viết"
      );
      console.error("Fetch posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const searchLower = searchQuery.toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content.title.toLowerCase().includes(searchLower) ||
      post.content.body.toLowerCase().includes(searchLower) ||
      (post.username?.toLowerCase() || "").includes(searchLower) ||
      (post.full_name?.toLowerCase() || "").includes(searchLower) ||
      post.email.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const openDeleteDialog = (postId: number) => {
    setDeletePostId(postId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deletePostId === null) return;

    setDeletingPostId(deletePostId);
    try {
      await adminService.deletePost(deletePostId, false);
      toast.success("Đã xóa bài viết");
      setPosts((prev) => prev.filter((p) => p.id !== deletePostId));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Không thể xóa bài viết");
    } finally {
      setDeletingPostId(null);
      setShowDeleteDialog(false);
      setDeletePostId(null);
    }
  };

  const toggleComments = (postId: number) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý bài viết
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý bài viết từ người dùng
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchPosts}
            disabled={loading}
            title="Tải lại"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <div className="bg-card px-4 py-2 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Tổng số bài viết</p>
            <p className="text-2xl font-bold text-foreground">{total}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề, nội dung, tên người dùng hoặc email..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải...</span>
        </div>
      )}

      {/* Posts List */}
      {!loading && (
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-card p-8 rounded-lg border border-border text-center">
              <p className="text-muted-foreground">
                Không tìm thấy bài viết nào
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const displayName = post.username || post.email.split("@")[0];
              const avatarColor = getAvatarColor(displayName);
              const showComments = expandedComments.has(post.id);

              return (
                <Card
                  key={post.id}
                  className="p-6 border-2 border-border rounded-2xl bg-card"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm ${avatarColor}`}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-base text-foreground">
                            {post.full_name || post.username || "Chưa có tên"}
                          </h3>
                          <p className="text-xs text-muted-foreground font-medium pt-0.5">
                            @{displayName} · Đăng vào{" "}
                            {formatDate(post.created_at)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.email}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(post.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2 text-foreground">
                      {post.content.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {post.content.body}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-dashed border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 font-bold text-muted-foreground cursor-default"
                    >
                      <Heart className="w-5 h-5" />
                      {post.like_count}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComments(post.id)}
                      className={`gap-2 font-bold hover:text-blue-500 hover:bg-blue-50 ${
                        showComments
                          ? "text-blue-500 bg-blue-50"
                          : "text-muted-foreground"
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" /> {post.comment_count}
                    </Button>
                  </div>

                  {/* Comments */}
                  {showComments && (
                    <AdminCommentSection
                      postId={post.id}
                      onCommentDeleted={() => {
                        // Cập nhật comment count
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === post.id
                              ? {
                                  ...p,
                                  comment_count: Math.max(
                                    0,
                                    p.comment_count - 1
                                  ),
                                }
                              : p
                          )
                        );
                      }}
                    />
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Xác nhận xóa bài viết
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không
              thể hoàn tác.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              className="font-bold"
              disabled={deletingPostId !== null}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="font-bold bg-red-500 text-white hover:bg-red-600"
              disabled={deletingPostId !== null}
            >
              {deletingPostId !== null ? (
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
