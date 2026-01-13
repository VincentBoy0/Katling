export interface Post {
    post_id: number,
    content: PostCreate,
    like_count: number,
    comment_count: number,
    is_liked_by_me: boolean,
    created_at: string,
}

export interface FeedPost extends Post {
    author_id: number,
    author_username: string,
}
export interface PostCreate {
    title: string,
    body: string,
}

export interface PostCommentCreate {
    content: string, 
}

export interface Comment {
    comment_id: number;
    post_id: number;
    author_id: number;
    author_username: string | null;
    content: string;
    is_deleted: boolean;
    created_at: string;
}

// Admin Post Types
export enum PostStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    DECLINED = "DECLINED",
    FLAGGED = "FLAGGED",
    ARCHIVED = "ARCHIVED",
}

export interface AdminPostListItem {
    id: number;
    user_id: number;
    username: string | null;
    full_name: string | null;
    email: string;
    content: PostCreate;
    status: PostStatus;
    like_count: number;
    comment_count: number;
    created_at: string;
}

export interface AdminPostListResponse {
    total: number;
    skip: number;
    limit: number;
    posts: AdminPostListItem[];
}

export interface PostStatsResponse {
    total_posts: number;
    deleted_posts: number;
    by_status: Record<string, number>;
}