import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Share2,
  Flag,
  Pencil,
  Trash2,
} from "lucide-react";
import { CommentSection } from "./CommentSection";

interface Comment {
  id: number;
  author: string;
  avatarColor: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: number;
  author: string;
  username: string;
  avatarColor: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  timestamp: string;
  isLiked: boolean;
  comments: Comment[];
}

interface PostCardProps {
  post: Post;
  isOwner: boolean;
  showEditActions: boolean;
  onToggleLike: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (post: Post) => void;
  onReport?: (id: number) => void;
  onShare: () => void;
  onAddComment: (id: number, content: string) => void;
}

export function PostCard({
  post,
  isOwner,
  showEditActions,
  onToggleLike,
  onDelete,
  onEdit,
  onReport,
  onShare,
  onAddComment,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <Card className="p-6 border-2 border-border rounded-2xl bg-card">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm ${post.avatarColor}`}
        >
          {post.author.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground hover:underline cursor-pointer">
                {post.author}{" "}
                {isOwner && (
                  <span className="text-muted-foreground font-normal">
                    (Bạn)
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {post.username} • {post.timestamp}
              </p>
            </div>
            <div className="flex gap-1">
              {showEditActions && isOwner ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(post)}
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(post.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : !isOwner ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onReport?.(post.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-50"
                >
                  <Flag className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2 text-foreground">{post.title}</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-dashed border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleLike(post.id)}
          className={`gap-2 font-bold hover:bg-red-50 ${
            post.isLiked
              ? "text-red-500 hover:text-red-600"
              : "text-muted-foreground"
          }`}
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
          {post.likes}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className={`gap-2 font-bold hover:text-blue-500 hover:bg-blue-50 ${
            showComments ? "text-blue-500 bg-blue-50" : "text-muted-foreground"
          }`}
        >
          <MessageCircle className="w-5 h-5" /> {post.commentsCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="gap-2 font-bold text-muted-foreground hover:text-green-500 hover:bg-green-50 ml-auto"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          comments={post.comments}
          onAddComment={(content) => onAddComment(post.id, content)}
        />
      )}
    </Card>
  );
}
