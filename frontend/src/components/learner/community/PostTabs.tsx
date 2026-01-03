import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/learner/tabs";
import { PostCard } from "./PostCard";

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

interface PostTabsProps {
  posts: Post[];
  currentUserName?: string;
  onToggleLike: (id: number) => void;
  onShare: (postId: number) => void;
  onAddComment: (postId: number, content: string) => void;
  onDelete?: (id: number) => void;
  onEdit?: (post: Post) => void;
  onReport?: (id: number) => void;
}

export function PostTabs({
  posts,
  currentUserName = "Bạn",
  onToggleLike,
  onShare,
  onAddComment,
  onDelete,
  onEdit,
  onReport,
}: PostTabsProps) {
  const myPosts = posts.filter((p) => p.author === currentUserName);

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
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isOwner={post.author === currentUserName}
            onToggleLike={onToggleLike}
            onShare={() => onShare(post.id)}
            onAddComment={onAddComment}
            onReport={onReport}
            showEditActions={false}
          />
        ))}
      </TabsContent>

      <TabsContent
        value="my-posts"
        className="space-y-6 animate-in fade-in slide-in-from-bottom-2"
      >
        {myPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isOwner={true}
            onToggleLike={onToggleLike}
            onShare={() => onShare(post.id)}
            onAddComment={onAddComment}
            onDelete={onDelete}
            onEdit={onEdit}
            showEditActions={true}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
}
