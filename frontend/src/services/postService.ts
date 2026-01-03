import { api } from "@/lib/api";
import { Post, FeedPost, PostCreate, PostCommentCreate } from "@/types/post";

export const postService = {
    getPostFeed(limit = 20, offset = 0) {
        return api.get<FeedPost[]>("/posts/feed", { params: { limit, offset } });
    },

    getUserPost(limit = 20, offset = 0) {
        return api.get<Post[]>("/users/me/posts", { params: { limit, offset } });
    },

    createPost({title, body} : PostCreate) {
        return api.post("/posts", {title, body});
    },

    deletePost(postId: number) {
        return api.delete(`/posts/${postId}`);
    },

    likePost(postId: number) {
        return api.post(`/posts/${postId}/like`);
    },

    unlikePost(postId: number) {
        return api.delete(`/posts/${postId}/like`);
    },

    createComment(postId: number, content: string) {
        return api.post(`/posts/${postId}/comments`, content);
    },

    deleteComment(postId: number, commentId: number) {
        return api.delete(`/posts/${postId}/comments/${commentId}`);
    },
}