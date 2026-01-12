import { Search, Trash2, MessageSquare, Heart } from "lucide-react";
import { useState } from "react";
import { FeedPost } from "@/types/post";

// Mock data for demonstration
const mockPosts: FeedPost[] = [
  {
    post_id: 1,
    author_id: 1,
    author_username: "nguyenvana",
    content: {
      title: "Mình vừa hoàn thành bài học đầu tiên!",
      body: "Cảm ơn Katling đã tạo ra một nền tảng học tiếng Anh tuyệt vời như vậy. Mình đã học được rất nhiều từ vựng mới và cảm thấy tự tin hơn khi giao tiếp.",
    },
    like_count: 15,
    comment_count: 3,
    is_liked_by_me: false,
    created_at: "2025-01-10T10:30:00Z",
  },
  {
    post_id: 2,
    author_id: 2,
    author_username: "tranthib",
    content: {
      title: "Chia sẻ kinh nghiệm học từ vựng",
      body: "Mình thấy việc học từ vựng qua flashcard rất hiệu quả. Mỗi ngày mình dành 30 phút để ôn lại những từ đã học và học thêm từ mới.",
    },
    like_count: 28,
    comment_count: 7,
    is_liked_by_me: false,
    created_at: "2025-01-11T14:20:00Z",
  },
  {
    post_id: 3,
    author_id: 3,
    author_username: "leminhc",
    content: {
      title: "Cần sửa lỗi trong bài học Grammar",
      body: "Mình phát hiện trong bài học về thì hiện tại hoàn thành có một câu hỏi bị lỗi. Đáp án đúng bị đánh dấu là sai.",
    },
    like_count: 5,
    comment_count: 2,
    is_liked_by_me: false,
    created_at: "2025-01-12T09:15:00Z",
  },
];

export default function PostsManagement() {
  const [posts] = useState<FeedPost[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState("");

  const searchLower = searchQuery.toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content.title.toLowerCase().includes(searchLower) ||
      post.content.body.toLowerCase().includes(searchLower) ||
      post.author_username.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = (postId: number) => {
    // TODO: Implement delete logic
    console.log("Delete post:", postId);
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
            Quản lý và kiểm duyệt bài viết từ người dùng
          </p>
        </div>
        <div className="bg-card px-4 py-2 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Tổng số bài viết</p>
          <p className="text-2xl font-bold text-foreground">{posts.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc tên người dùng..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <p className="text-muted-foreground">Không tìm thấy bài viết nào</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.post_id}
              className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow"
            >
              {/* Post Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {post.author_username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {post.author_username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {post.content.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDelete(post.post_id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                  title="Xóa bài viết"
                >
                  <Trash2 className="w-5 h-5 text-muted-foreground group-hover:text-red-500" />
                </button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-foreground whitespace-pre-wrap">
                  {post.content.body}
                </p>
              </div>

              {/* Post Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{post.like_count} lượt thích</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">
                    {post.comment_count} bình luận
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
