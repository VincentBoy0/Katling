export enum PostStatus {
    PENDING = "PENDING",           
    ACCEPTED = "ACCEPTED",         
    DECLINED = "DECLINED",        
    FLAGGED = "FLAGGED",        
    ARCHIVED = "ARCHIVED",       
}

export interface Post {
    id: number,
    user_id: number,
    content: Record<string, any>,
    status: PostStatus,
    like_count: number,
    comment_count: number,
    is_deleted: boolean,
    created_at: string,
}

export interface PostComment {
    id: number,
    post_id: number,
    user_id: number,
    content: string,
    is_deleted: boolean,
    created_at: string,
}

export interface PostLike {
    id: number,
    post_id: number, 
    user_id: number,
    created_at: string,
}