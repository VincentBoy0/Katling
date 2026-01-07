import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Flag } from "lucide-react";
import { CommentSection } from "./CommentSection";
import { FeedPost } from "@/types/post";
import { getAvatarColor } from "@/lib/avatar";
import { ReportCreate } from "@/types/report";

interface PostCardProps {
  post: FeedPost;
  onToggleLike: (postId: number, isLiked: boolean) => void;
  onAddComment: (postId: number, content: string) => void;
  onReportClick: (postId: number) => void;
}

export function FeedPostCard({
  post,
  onToggleLike,
  onAddComment,
  onReportClick,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const displayName = post.author_username || "Unknown User";
  const avatarColor = getAvatarColor(displayName);

  return (
    <Card className="p-6 border-2 border-border rounded-2xl bg-card">
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
              <h3 className="font-bold text-base text-foreground hover:underline cursor-pointer">
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground font-medium pt-0.5">
                Được đăng vào {post.created_at.slice(0, 10)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onReportClick(post.post_id)}
                className="h-8 w-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-50"
              >
                <Flag className="w-4 h-4" />
              </Button>
            </div>
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
          onClick={() => onToggleLike(post.post_id, post.is_liked_by_me)}
          className={`gap-2 font-bold hover:bg-red-50 ${
            post.is_liked_by_me
              ? "text-red-500 hover:text-red-600"
              : "text-muted-foreground"
          }`}
        >
          <Heart
            className={`w-5 h-5 ${post.is_liked_by_me ? "fill-current" : ""}`}
          />
          {post.like_count}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className={`gap-2 font-bold hover:text-blue-500 hover:bg-blue-50 ${
            showComments ? "text-blue-500 bg-blue-50" : "text-muted-foreground"
          }`}
        >
          <MessageCircle className="w-5 h-5" /> {post.comment_count}
        </Button>
      </div>

      {showComments && (
        <CommentSection
          onAddComment={(content) => onAddComment(post.post_id, content)}
        />
      )}
    </Card>
  );
}
