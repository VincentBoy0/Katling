import { api } from "@/lib/api";
import { Friend, UserSearchResult, FriendRequest, FriendRequestCreate, FriendRequestReturn } from "@/types/friend";

export const friendService = {
    getFriendsList() {
        return api.get<Friend[]>("/friends");
    },

    searchUsers(query: string) {
        return api.get<UserSearchResult[]>("/friends/search", { params: { query } });
    },
    
    getFriendRequests() {
        return api.get<FriendRequest[]>("/friend-requests/incoming");
    },

    sendFriendRequest(payload : FriendRequestCreate) {
        console.log("Friend request payload:", JSON.stringify(payload));
        return api.post<FriendRequestReturn>("/friend-requests", payload);
    },

    acceptFriendRequest(requestId: number) {
        console.log(`Accepting friend request: POST /friend-requests/${requestId}/accept`);
        return api.post(`/friend-requests/${requestId}/accept`);
    },

    rejectFriendRequest(requestId: number) {
        console.log(`Rejecting friend request: POST /friend-requests/${requestId}/reject`);
        return api.post(`/friend-requests/${requestId}/reject`);
    },
}