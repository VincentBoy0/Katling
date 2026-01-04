import { useState } from "react";
import { FeedPost, Post } from "@/types/post";
import { postService } from "@/services/postService";

export function usePost() {
    const [feed, setFeed] = useState<FeedPost[]>([]);
    const [userPost, setUserPost] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get feed for user
    const getFeed = async (limit = 20, offset = 0) => {
        setLoading(true);
        setError(null);

        try {
            const res = await postService.getPostFeed(limit, offset);
            setFeed(res.data);
        } catch (err: any) {
            setError(err?.res?.data?.detail || err.message || "Cannot fetch post feed"); 
        } finally {
            setLoading(false);
        }
    };

    // Get user post
    const getUserPost = async (limit = 20, offset = 0) => {
        setLoading(true);
        setError(null);

        try {
            const res = await postService.getUserPost(limit, offset);
            setUserPost(res.data);
        } catch (err: any) {
            setError(err?.res?.data?.detail || err.message || "Cannot fetch user's posts"); 
        } finally {
            setLoading(false);
        }
    }

    // Create new post
    const createPost = async (title: string, body: string) => {
        setLoading(true);
        setError(null);

        try  {
            const res = await postService.createPost({title, body});
            console.log("Post created:", res.data);
            return res.data;
        } catch (err: any) {
            const errorMsg = err?.response?.data?.detail || err?.message || "Cannot create new post";
            setError(errorMsg);
            console.error("Create post error:", err.response || err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete post
    const deletePost = async (postId: number) => {
        // Optimistic update
        setFeed(prev => prev.filter(p => p.post_id !== postId));
        setUserPost(prev => prev.filter(p => p.post_id !== postId));

        try  {
            await postService.deletePost(postId);
        } catch (err: any) {
            // Note: We don't rollback delete - user will need to refresh
            setError(err?.data?.detail || err.message || "Cannot delete post");
            throw err;
        }
    };

    // Like/Unlike
    const likePost = async (postId: number) => {
        // Optimistic update
        setFeed(prev => prev.map(p => 
            p.post_id === postId 
                ? { ...p, is_liked_by_me: true, like_count: p.like_count + 1 }
                : p
        ));
        setUserPost(prev => prev.map(p => 
            p.post_id === postId 
                ? { ...p, is_liked_by_me: true, like_count: p.like_count + 1 }
                : p
        ));

        try  {
            await postService.likePost(postId);
        } catch (err: any) {
            // Rollback on error
            setFeed(prev => prev.map(p => 
                p.post_id === postId 
                    ? { ...p, is_liked_by_me: false, like_count: p.like_count - 1 }
                    : p
            ));
            setUserPost(prev => prev.map(p => 
                p.post_id === postId 
                    ? { ...p, is_liked_by_me: false, like_count: p.like_count - 1 }
                    : p
            ));
            setError(err?.data?.detail || err.message);
            throw err;
        } 
    };

    const unlikePost = async (postId: number) => {
        // Optimistic update
        setFeed(prev => prev.map(p => 
            p.post_id === postId 
                ? { ...p, is_liked_by_me: false, like_count: p.like_count - 1 }
                : p
        ));
        setUserPost(prev => prev.map(p => 
            p.post_id === postId 
                ? { ...p, is_liked_by_me: false, like_count: p.like_count - 1 }
                : p
        ));

        try {
            await postService.unlikePost(postId);
        } catch (err: any) {
            // Rollback on error
            setFeed(prev => prev.map(p => 
                p.post_id === postId 
                    ? { ...p, is_liked_by_me: true, like_count: p.like_count + 1 }
                    : p
            ));
            setUserPost(prev => prev.map(p => 
                p.post_id === postId 
                    ? { ...p, is_liked_by_me: true, like_count: p.like_count + 1 }
                    : p
            ));
            setError(err?.response?.data?.detail || err.message);
            throw err;
        }
    };

    // Comment/Delete comment
    const createComment = async (postId: number, content: string) => {
        // Optimistic update comment count
        setFeed(prev => prev.map(p => 
            p.post_id === postId 
                ? { ...p, comment_count: p.comment_count + 1 }
                : p
        ));
        setUserPost(prev => prev.map(p => 
            p.post_id === postId 
                ? { ...p, comment_count: p.comment_count + 1 }
                : p
        ));

        try {
            const response = await postService.createComment(postId, content);
            return response.data;
        } catch (err: any) {
            // Rollback on error
            setFeed(prev => prev.map(p => 
                p.post_id === postId 
                    ? { ...p, comment_count: p.comment_count - 1 }
                    : p
            ));
            setUserPost(prev => prev.map(p => 
                p.post_id === postId 
                    ? { ...p, comment_count: p.comment_count - 1 }
                    : p
            ));
            setError(err?.response?.data?.detail || err.message);
            throw err;
        }
    };

    const deleteComment = async (postId: number, commentId: number) => {
        try {
            await postService.deleteComment(postId, commentId);
        } catch (err: any) {
            setError(err?.response?.data?.detail || err.message);
            throw err;
        }
    };

    return {
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
    };
}