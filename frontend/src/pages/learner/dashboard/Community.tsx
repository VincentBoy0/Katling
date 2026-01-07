import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CommunityHeader,
  FriendsSidebar,
  PostTabs,
  CreatePostDialog,
  FindFriendsDialog,
  ShareDialog,
  FriendProfileDialog,
} from "@/components/learner/community";
import { ReportDialog } from "@/components/learner/management/ReportDialog";

import { FriendRequestsSidebar } from "@/components/learner/community/FriendRequestsSidebar";

import { usePost } from "@/hooks/usePost";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useReport } from "@/hooks/useReport";
import { ReportCreate } from "@/types/report";
import { useFriend } from "@/hooks/useFriend";

import { Friend } from "@/types/friend";

export default function CommunityPage() {
  const {
    feed,
    userPost,
    loading,
    error,
    getFeed,
    getUserPost,
    createPost,
    deletePost,
    likePost,
    unlikePost,
    createComment,
    deleteComment,
  } = usePost();

  const { createReport } = useReport();

  const { userInfo } = useUserInfo();
  const {
    friends,
    searchResults,
    friendRequests,
    getFriendsList,
    searchUsers,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriend();

  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportPostId, setReportPostId] = useState<number | null>(null);

  const [showFindFriendsDialog, setShowFindFriendsDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  // const [shareLink, setShareLink] = useState("https://katling.app/invite/u/me");

  const handleToggleLike = async (postId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (err: any) {
      toast.error("Có lỗi khi like bài viết");
    }
  };

  const handleAddComment = async (postId: number, content: string) => {
    try {
      console.log("Adding comment:", { postId, content });
      const result = await createComment(postId, content);
      console.log("Comment created:", result);
      toast.success("Đã thêm bình luận");
    } catch (err: any) {
      console.error("Comment error:", err.response || err);
      toast.error(err?.response?.data?.detail || "Có lỗi khi thêm comment");
    }
  };

  const openReportDialog = (postId: number) => {
    setReportPostId(postId);
    setShowReportDialog(true);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      toast.success("Đã xóa bài viết");
    } catch (err: any) {
      toast.error("Có lỗi khi xóa bài viết");
    }
  };

  const handleCreatePost = async (title: string, body: string) => {
    try {
      await createPost(title, body);
      setShowCreatePostDialog(false);
      toast.success("Đăng bài thành công!");
      await getFeed();
      await getUserPost();
    } catch (err: any) {
      toast.error(err?.message || "Đăng bài thất bại");
      console.error("Create post error:", err);
    }
  };

  const handleReport = async (data: ReportCreate) => {
    try {
      await createReport({
        ...data,
        affected_post_id: reportPostId ?? undefined,
      });
      toast.success("Đã gửi báo cáo");
    } catch (err: any) {
      toast.error(err?.message || "Báo cáo thất bại");
    } finally {
      setShowReportDialog(false);
      setReportPostId(null);
    }
  };

  const handleFindFriend = async (query: string) => {
    await searchUsers(query);
  };

  const handleAddFriend = async (receiverId: number) => {
    try {
      await sendFriendRequest(receiverId);
      toast.success("Đã gửi lời mời kết bạn");
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail || "Không thể gửi lời mời kết bạn";
      toast.error(errorMsg);
    }
  };

  const handleAcceptFriend = async (requestId: number) => {
    try {
      await acceptFriendRequest(requestId);
      toast.success("Đã chấp nhận lời mời kết bạn");
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail || "Không thể chấp nhận lời mời";
      toast.error(errorMsg);
    }
  };

  const handleRejectFriend = async (requestId: number) => {
    try {
      await rejectFriendRequest(requestId);
      toast.success("Đã từ chối lời mời kết bạn");
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail || "Không thể từ chối lời mời";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    getFeed();
    getUserPost();
    getFriendsList();
    getFriendRequests();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      <CommunityHeader
        onCreatePost={() => setShowCreatePostDialog(true)}
        onFindFriends={() => setShowFindFriendsDialog(true)}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <strong className="font-bold">Lỗi: </strong>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <FriendsSidebar
            friends={friends}
            onFriendClick={setSelectedFriend}
            // onInviteClick={() =>
            //   openShareDialog("https://katling.app/invite/u/me")
            // }
          />

          <FriendRequestsSidebar
            requests={friendRequests}
            onAccept={handleAcceptFriend}
            onReject={handleRejectFriend}
          />
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-6">
          <PostTabs
            feedPosts={feed}
            userPosts={userPost}
            user={userInfo}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onDelete={handleDeletePost}
            onReportClick={openReportDialog}
          />
        </div>
      </div>

      {/* Dialogs
      <ShareDialog
        open={showShareDialog}
        shareLink={shareLink}
        onOpenChange={setShowShareDialog}
        onCopyLink={handleCopyLink}
        onPlatformClick={handlePlatformClick}
      /> */}

      <FindFriendsDialog
        open={showFindFriendsDialog}
        users={searchResults}
        onOpenChange={setShowFindFriendsDialog}
        onFindFriend={handleFindFriend}
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

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onSubmit={handleReport}
        postId={reportPostId}
      />
    </div>
  );
}
