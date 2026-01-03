import { useState } from "react";
import { Post } from "@/types/post";
import { postService } from "@/services/postService";

export function usePost() {
    const [feed, setFeed] = useState<Post[]>([]);
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

    // Create new post
    const createPost = async (title: string, body: string) => {
        setLoading(true);
        setError(null);

        try  {
            const res = await postService.createPost(title, body);
            return res.data;
        } catch (err: any) {
            setError(err?.data?.detail || err.message || "Cannot create new post");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete post
    const deletePost = async (postId: number) => {
        setLoading(true);
        setError(null);

        try  {
            const res = await postService.deletePost(postId);
            setFeed(prev => prev.filter(p => p.id !== postId));
        } catch (err: any) {
            setError(err?.data?.detail || err.message || "Cannot delete post");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Like/Unlike
    const likePost = async (postId: number) => {
        try  {
            await postService.likePost(postId);
        } catch (err: any) {
            setError(err?.data?.detail || err.message);
            throw err;
        } 
    };

    const unlikePost = async (postId: number) => {
        try {
            await postService.unlikePost(postId);
        } catch (err: any) {
            setError(err?.response?.data?.detail || err.message);
            throw err;
        }
    };

    // Comment/Delete commen
    const createComment = async (postId: number, content: string) => {
        try {
            const response = await postService.createComment(postId, content);
            return response.data;
        } catch (err: any) {
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
        loading,
        error,
        getFeed,
        createPost,
        deletePost,
        likePost,
        unlikePost,
        createComment,
        deleteComment,
    };
}