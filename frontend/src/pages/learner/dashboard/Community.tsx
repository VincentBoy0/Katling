import type React from "react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  User,
  UserPlus,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  X,
  Users,
  Flag,
  Pencil,
  Trash2,
  Flame,
  Zap,
  Trophy,
  Calendar,
  MessageSquare,
  UserMinus,
  Copy,
  Facebook,
  Twitter,
  Mail,
  Send,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";

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
  comments: Comment[]; // Thêm danh sách comment
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
  isFriend: boolean; // Trạng thái kết bạn
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

// Danh sách người dùng để tìm kiếm
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

const SHARE_PLATFORMS = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600 text-white",
    border: "border-blue-700",
  },
  {
    name: "Twitter",
    icon: Twitter,
    color: "bg-black text-white",
    border: "border-gray-800",
  },
  {
    name: "Email",
    icon: Mail,
    color: "bg-gray-500 text-white",
    border: "border-gray-600",
  },
  {
    name: "Telegram",
    icon: Send,
    color: "bg-sky-500 text-white",
    border: "border-sky-600",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700 text-white",
    border: "border-blue-800",
  },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  // Dialog States
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const [showEditPostDialog, setShowEditPostDialog] = useState(false);
  const [showFindFriendsDialog, setShowFindFriendsDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false); // Share Dialog
  const [selectedFriend, setSelectedFriend] = useState<FriendDetail | null>(
    null
  ); // Profile Dialog

  // States for Logic
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [shareLink, setShareLink] = useState("https://katling.app/invite/u/me");

  // Dữ liệu bạn bè (Lọc từ allUsers những người isFriend = true)
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

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: Post = {
      id: Date.now(),
      author: "Bạn",
      username: "@you",
      avatarColor: "bg-purple-100 text-purple-600",
      title: postTitle,
      content: postContent,
      likes: 0,
      commentsCount: 0,
      timestamp: "Vừa xong",
      isLiked: false,
      comments: [],
    };
    setPosts([newPost, ...posts]);
    setPostTitle("");
    setPostContent("");
    setShowCreatePostDialog(false);
    toast.success("Đăng bài thành công!");
  };

  const handleUpdatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setPosts(
      posts.map((p) =>
        p.id === editingPost.id
          ? { ...p, title: editTitle, content: editContent }
          : p
      )
    );
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

  const openShareDialog = (link: string) => {
    setShareLink(link);
    setShowShareDialog(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Đã sao chép liên kết!");
  };

  const handleAddFriend = (id: number) => {
    // Logic giả lập gửi lời mời
    toast.success("Đã gửi lời mời kết bạn!");
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Cộng đồng
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Chia sẻ hành trình, kết nối đam mê.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowFindFriendsDialog(true)}
            className="border-2 font-bold h-10"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Tìm bạn
          </Button>
          <Button
            onClick={() => setShowCreatePostDialog(true)}
            className="font-bold shadow-md h-10 bg-primary hover:bg-primary/90 text-white border-primary-foreground/20 active:border-b-0 active:translate-y-1 transition-all"
          >
            <Plus className="w-5 h-5 mr-1" /> Đăng bài
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. SIDEBAR FRIENDS */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-card border-2 border-border rounded-2xl p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Bạn bè ({friends.length})</h2>
              <button
                onClick={() =>
                  openShareDialog("https://katling.app/invite/u/me")
                }
                className="p-1.5 hover:bg-muted rounded-lg transition-colors group"
                title="Mời bạn bè"
              >
                <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </button>
            </div>
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend)}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-secondary-foreground border border-border ${friend.avatarColor}`}
                  >
                    {friend.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">
                      {friend.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      LVL {friend.level} • {friend.streak} 🔥
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. MAIN TABS */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
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
                  isOwner={post.author === "Bạn"}
                  onToggleLike={toggleLike}
                  onShare={() =>
                    openShareDialog(`https://katling.app/post/${post.id}`)
                  }
                  onAddComment={handleAddComment}
                  showEditActions={false}
                />
              ))}
            </TabsContent>

            <TabsContent
              value="my-posts"
              className="space-y-6 animate-in fade-in slide-in-from-bottom-2"
            >
              {posts
                .filter((p) => p.author === "Bạn")
                .map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isOwner={true}
                    onToggleLike={toggleLike}
                    onShare={() =>
                      openShareDialog(`https://katling.app/post/${post.id}`)
                    }
                    onAddComment={handleAddComment}
                    onDelete={handleDeletePost}
                    onEdit={(p) => {
                      setEditingPost(p);
                      setEditTitle(p.title);
                      setEditContent(p.content);
                      setShowEditPostDialog(true);
                    }}
                    showEditActions={true}
                  />
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* --- DIALOGS --- */}

      {/* 1. SHARE DIALOG (YOUTUBE STYLE) */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md border-2 border-border rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-center">
              Chia sẻ
            </DialogTitle>
            <DialogDescription className="text-center font-medium">
              Mời bạn bè cùng học hoặc chia sẻ bài viết thú vị!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-4 gap-4 px-2">
              {SHARE_PLATFORMS.map((platform) => (
                <div
                  key={platform.name}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                  onClick={() => toast.info(`Đã mở ${platform.name}`)}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 hover:scale-105 ${platform.color} ${platform.border}`}
                  >
                    <platform.icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors text-center">
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-muted/40 p-1.5 rounded-2xl border-2 border-border flex items-center gap-2">
              <Input
                value={shareLink}
                readOnly
                className="border-none bg-transparent focus-visible:ring-0 font-medium text-muted-foreground h-10"
              />
              <Button
                onClick={handleCopyLink}
                className="h-10 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-sm shrink-0"
              >
                <Copy className="w-4 h-4 mr-2" /> Sao chép
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. FIND FRIENDS DIALOG (UPDATED) */}
      <Dialog
        open={showFindFriendsDialog}
        onOpenChange={setShowFindFriendsDialog}
      >
        <DialogContent className="sm:max-w-md border-2 border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Tìm bạn bè</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nhập tên hoặc email..."
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                className="pl-9 border-2 font-medium"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {allUsers
                .filter(
                  (u) =>
                    !u.isFriend &&
                    u.name
                      .toLowerCase()
                      .includes(friendSearchQuery.toLowerCase())
                )
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.avatarColor}`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-sm block">
                          {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.username}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddFriend(user.id)}
                      className="h-8 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold transition-colors"
                    >
                      <UserPlus className="w-4 h-4 mr-1" /> Thêm
                    </Button>
                  </div>
                ))}
              {allUsers.filter(
                (u) =>
                  !u.isFriend &&
                  u.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
              ).length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Không tìm thấy kết quả.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. PROFILE DIALOG (Giữ nguyên) */}
      <Dialog
        open={!!selectedFriend}
        onOpenChange={(open) => !open && setSelectedFriend(null)}
      >
        <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-transparent shadow-none">
          {selectedFriend && (
            <Card className="w-full border-2 border-border rounded-3xl overflow-hidden bg-card">
              <div
                className={`h-24 w-full ${
                  selectedFriend.avatarColor.split(" ")[0]
                } opacity-50 relative`}
              ></div>
              <div className="px-6 pb-6 -mt-10 flex flex-col items-center">
                <div
                  className={`w-24 h-24 rounded-full border-4 border-card flex items-center justify-center text-3xl font-black shadow-sm ${selectedFriend.avatarColor}`}
                >
                  {selectedFriend.name.charAt(0)}
                </div>
                <div className="text-center mt-3 mb-6 space-y-1">
                  <h2 className="text-2xl font-black text-foreground">
                    {selectedFriend.name}
                  </h2>
                  <p className="text-muted-foreground font-medium">
                    {selectedFriend.username}
                  </p>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 w-full mb-6">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-orange-700">
                      {selectedFriend.streak}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-orange-600/70">
                      Streak
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 text-center">
                    <Zap className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-blue-700">
                      {(selectedFriend.totalXp / 1000).toFixed(1)}k
                    </p>
                    <p className="text-[10px] uppercase font-bold text-blue-600/70">
                      XP
                    </p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 text-center">
                    <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-yellow-700">
                      {selectedFriend.league}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-yellow-600/70">
                      Hạng
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. CREATE & EDIT POST DIALOGS (Giữ nguyên như cũ) */}
      <Dialog
        open={showCreatePostDialog}
        onOpenChange={setShowCreatePostDialog}
      >
        <DialogContent className="sm:max-w-md border-2 border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Tạo bài viết mới
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4 pt-2">
            <Input
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              required
              placeholder="Tiêu đề..."
              className="border-2"
            />
            <Textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
              rows={5}
              placeholder="Nội dung..."
              className="border-2 resize-none"
            />
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreatePostDialog(false)}
                className="flex-1 font-bold"
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1 font-bold shadow-sm">
                Đăng bài
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditPostDialog} onOpenChange={setShowEditPostDialog}>
        <DialogContent className="sm:max-w-md border-2 border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Chỉnh sửa bài viết
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePost} className="space-y-4 pt-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              className="border-2"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              required
              rows={5}
              className="border-2 resize-none"
            />
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowEditPostDialog(false)}
                className="flex-1 font-bold"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 font-bold shadow-sm bg-primary text-white"
              >
                Lưu
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- SUB COMPONENT: POST CARD (UPDATED WITH COMMENTS) ---
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

function PostCard({
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
  const [commentInput, setCommentInput] = useState("");

  const submitComment = () => {
    if (!commentInput.trim()) return;
    onAddComment(post.id, commentInput);
    setCommentInput("");
  };

  return (
    <Card className="p-6 border-2 border-border rounded-2xl bg-card">
      {/* Header & Content (Giữ nguyên) */}
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
          <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />{" "}
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

      {/* Comment Section (Collapsible) */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in fade-in slide-in-from-top-2">
          {post.comments.length > 0 ? (
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${comment.avatarColor}`}
                  >
                    {comment.author.charAt(0)}
                  </div>
                  <div className="flex-1 bg-muted/30 p-3 rounded-xl rounded-tl-none">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-sm">
                        {comment.author}
                      </span>
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

          {/* Input */}
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
      )}
    </Card>
  );
}
