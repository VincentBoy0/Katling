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