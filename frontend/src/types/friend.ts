export enum RelationshipStatus {
    FRIENDS = "FRIENDS",
    REQUEST_SENT = "REQUEST_SENT",
    REQUEST_RECEIVED = "REQUEST_RECEIVED",
    NONE = "NONE",
}

export enum StatusRequestType {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
}

export interface Friend {
    user_id: number;
    username: string;
    xp: number;
    streak: number;
};

export interface UserSearchResult {
    user_id: number;
    username: string;
    relationship_status: RelationshipStatus;
}

export interface FriendRequest {
    request_id: number;
    sender_id: number;
    sender_username: string;
    created_at: string;
}

export interface FriendRequestCreate {
    receiver_id: number;
}

export interface FriendRequestReturn extends FriendRequest {
    id: number;
    sender_id: number;
    receiver_id: number;
    status: StatusRequestType;
    created_at: string;
}