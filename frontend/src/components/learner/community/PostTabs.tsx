import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/learner/tabs";
import { PostCard } from "./PostCard";
import { FeedPostCard } from "./FeedPostCard";
import { Post, FeedPost } from "@/types/post";
import { UserInfo } from "@/types/user";

interface PostTabsProps {
  feedPosts: FeedPost[];
  userPosts: Post[];
  user: UserInfo | null;
  onToggleLike: (postId: number, isLiked: boolean) => void;
  onAddComment: (postId: number, content: string) => void;
  onDelete: (postId: number) => void;
  // onReport?: (id: number) => void;
}

export function PostTabs({
  feedPosts,
  userPosts,
  user,
  onToggleLike,
  onAddComment,
  onDelete,
}: // onReport,
PostTabsProps) {
  return (
    <Tabs defaultValue="feed" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl mb-6 border-2 border-transparent">
        <TabsTrigger
          value="feed"
          className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
        >
          Bảng tin
        </TabsTrigger>
        <TabsTrigger
          value="my-posts"
          className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
        >
          Bài của tôi
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="feed"
        className="space-y-6 animate-in fade-in slide-in-from-bottom-2"
      >
        {feedPosts.map((post) => (
          <FeedPostCard
            key={post.post_id}
            post={post}
            onToggleLike={onToggleLike}
            onAddComment={onAddComment}
            // onReport={onReport}
          />
        ))}
      </TabsContent>

      <TabsContent
        value="my-posts"
        className="space-y-6 animate-in fade-in slide-in-from-bottom-2"
      >
        {userPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Bạn chưa có bài viết nào.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Hãy tạo bài viết đầu tiên của bạn!
            </p>
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              user={user}
              onToggleLike={onToggleLike}
              onAddComment={onAddComment}
              onDelete={onDelete}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
