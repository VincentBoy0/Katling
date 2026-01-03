import { useState } from "react";
import { toast } from "sonner";
import {
  CommunityHeader,
  FriendsSidebar,
  PostTabs,
  CreatePostDialog,
  EditPostDialog,
  FindFriendsDialog,
  ShareDialog,
  FriendProfileDialog,
} from "@/components/learner/community";

// --- TYPES ---
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

interface FriendDetail {
  id: number;
  name: string;
  username: string;
  email?: string;
  avatarColor: string;
  joinedDate: string;
  level: number;
  streak: number;
  totalXp: number;
  league: string;
  badges: string[];
  isFriend: boolean;
}

// --- MOCK DATA ---
const mockComments: Comment[] = [
  {
    id: 101,
    author: "Lê Quân",
    avatarColor: "bg-green-100 text-green-600",
    content: "Hay quá! Mình sẽ thử áp dụng.",
    timestamp: "10 phút trước",
  },
  {
    id: 102,
    author: "Phạm Linh",
    avatarColor: "bg-orange-100 text-orange-600",
    content: "Bạn dùng app gì để nghe nhạc vậy?",
    timestamp: "5 phút trước",
  },
];

const mockPosts: Post[] = [
  {
    id: 1,
    author: "Nguyễn Minh",
    username: "@minhnguyen",
    avatarColor: "bg-blue-100 text-blue-600",
    title: "Mẹo học phát âm hiệu quả",
    content:
      "Tôi vừa khám phá rằng việc nghe nhạc tiếng Anh mỗi ngày giúp rất nhiều cho phát âm. Bạn thử xem! 🎵",
    likes: 24,
    commentsCount: 2,
    timestamp: "2 giờ trước",
    isLiked: false,
    comments: mockComments,
  },
  {
    id: 2,
    author: "Trần Hà",
    username: "@hatran123",
    avatarColor: "bg-pink-100 text-pink-600",
    title: "Đã hoàn thành Unit 5!",
    content:
      "Rất vui vì tôi đã hoàn thành Unit 5 với điểm tuyệt đối. Cảm ơn Katling đã giúp mình có động lực mỗi ngày! 🔥",
    likes: 42,
    commentsCount: 0,
    timestamp: "4 giờ trước",
    isLiked: true,
    comments: [],
  },
];

const allUsers: FriendDetail[] = [
  {
    id: 1,
    name: "Nguyễn Minh",
    username: "@minhnguyen",
    email: "minh@ex.com",
    avatarColor: "bg-blue-100 text-blue-600",
    joinedDate: "10/2024",
    level: 25,
    streak: 45,
    totalXp: 12500,
    league: "Ruby",
    badges: ["🔥"],
    isFriend: true,
  },
  {
    id: 2,
    name: "Trần Hà",
    username: "@hatran123",
    email: "ha@ex.com",
    avatarColor: "bg-pink-100 text-pink-600",
    joinedDate: "11/2024",
    level: 23,
    streak: 42,
    totalXp: 11200,
    league: "Sapphire",
    badges: ["🎯"],
    isFriend: true,
  },
  {
    id: 3,
    name: "Hoàng Nam",
    username: "@namhoang",
    email: "nam@ex.com",
    avatarColor: "bg-yellow-100 text-yellow-600",
    joinedDate: "12/2024",
    level: 5,
    streak: 2,
    totalXp: 500,
    league: "Đồng",
    badges: [],
    isFriend: false,
  },
  {
    id: 4,
    name: "Lê Quân",
    username: "@lequan",
    email: "quan@ex.com",
    avatarColor: "bg-green-100 text-green-600",
    joinedDate: "01/2025",
    level: 10,
    streak: 12,
    totalXp: 3000,
    league: "Bạc",
    badges: [],
    isFriend: false,
  },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  // Dialog States
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const [showEditPostDialog, setShowEditPostDialog] = useState(false);
  const [showFindFriendsDialog, setShowFindFriendsDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendDetail | null>(
    null
  );
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [shareLink, setShareLink] = useState("https://katling.app/invite/u/me");

  const friends = allUsers.filter((u) => u.isFriend);

  // --- HANDLERS ---
  const toggleLike = (id: number) => {
    setPosts(
      posts.map((p) =>
        p.id === id
          ? {
              ...p,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              isLiked: !p.isLiked,
            }
          : p
      )
    );
  };

  const handleAddComment = (postId: number, content: string) => {
    const newComment: Comment = {
      id: Date.now(),
      author: "Bạn",
      avatarColor: "bg-purple-100 text-purple-600",
      content: content,
      timestamp: "Vừa xong",
    };

    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...p.comments, newComment],
              commentsCount: p.commentsCount + 1,
            }
          : p
      )
    );
  };

  const handleCreatePost = (title: string, content: string) => {
    const newPost: Post = {
      id: Date.now(),
      author: "Bạn",
      username: "@you",
      avatarColor: "bg-purple-100 text-purple-600",
      title,
      content,
      likes: 0,
      commentsCount: 0,
      timestamp: "Vừa xong",
      isLiked: false,
      comments: [],
    };
    setPosts([newPost, ...posts]);
    setShowCreatePostDialog(false);
    toast.success("Đăng bài thành công!");
  };

  const handleUpdatePost = (id: number, title: string, content: string) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, title, content } : p)));
    setShowEditPostDialog(false);
    setEditingPost(null);
    toast.success("Cập nhật thành công!");
  };

  const handleDeletePost = (id: number) => {
    if (confirm("Xóa bài viết này?")) {
      setPosts(posts.filter((p) => p.id !== id));
      toast.info("Đã xóa bài viết");
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowEditPostDialog(true);
  };

  const openShareDialog = (link: string) => {
    setShareLink(link);
    setShowShareDialog(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Đã sao chép liên kết!");
  };

  const handlePlatformClick = (platform: string) => {
    toast.info(`Đã mở ${platform}`);
  };

  const handleAddFriend = (id: number) => {
    toast.success("Đã gửi lời mời kết bạn!");
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      <CommunityHeader
        onCreatePost={() => setShowCreatePostDialog(true)}
        onFindFriends={() => setShowFindFriendsDialog(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FriendsSidebar
          friends={friends}
          onFriendClick={setSelectedFriend}
          onInviteClick={() =>
            openShareDialog("https://katling.app/invite/u/me")
          }
        />

        <div className="col-span-1 lg:col-span-2 space-y-6">
          <PostTabs
            posts={posts}
            currentUserName="Bạn"
            onToggleLike={toggleLike}
            onShare={(postId) =>
              openShareDialog(`https://katling.app/post/${postId}`)
            }
            onAddComment={handleAddComment}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            onReport={(id) => toast.info("Đã báo cáo bài viết")}
          />
        </div>
      </div>

      {/* Dialogs */}
      <ShareDialog
        open={showShareDialog}
        shareLink={shareLink}
        onOpenChange={setShowShareDialog}
        onCopyLink={handleCopyLink}
        onPlatformClick={handlePlatformClick}
      />

      <FindFriendsDialog
        open={showFindFriendsDialog}
        users={allUsers}
        onOpenChange={setShowFindFriendsDialog}
        onAddFriend={handleAddFriend}
      />

      <FriendProfileDialog
        friend={selectedFriend}
        onOpenChange={(open) => !open && setSelectedFriend(null)}
      />

      <CreatePostDialog
        open={showCreatePostDialog}
        onOpenChange={setShowCreatePostDialog}
        onSubmit={handleCreatePost}
      />

      <EditPostDialog
        open={showEditPostDialog}
        post={editingPost}
        onOpenChange={setShowEditPostDialog}
        onSubmit={handleUpdatePost}
      />
    </div>
  );
}
