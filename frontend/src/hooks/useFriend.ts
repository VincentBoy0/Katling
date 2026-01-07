import { Friend, FriendRequest, UserSearchResult } from "@/types/friend";
import { useState, useEffect, use } from "react";
import { friendService } from "@/services/friendService";

export function useFriend() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [friends, setFriends] = useState<Friend[]>([]);
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

    const getFriendsList = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await friendService.getFriendsList();
            setFriends(response.data);
        } catch (err) {
            setError("Failed to fetch friends list.");
        } finally {
            setLoading(false);
        }
    }

    const searchUsers = async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await friendService.searchUsers(query);
            setSearchResults(response.data);
        } catch (err) {
            setError("Failed to search users.");
        } finally {
            setLoading(false);
        }
    }

    const getFriendRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await friendService.getFriendRequests();
            setFriendRequests(response.data);
        } catch (err) {
            setError("Failed to fetch friend requests.");
        } finally {
            setLoading(false);
        } 
    }

    const sendFriendRequest = async (receiverId: number) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Sending friend request with payload:", { receiver_id: receiverId });
            await friendService.sendFriendRequest({ receiver_id: receiverId });
            // Update search results to reflect sent request
            setSearchResults(prev => 
                prev.map(user => 
                    user.user_id === receiverId 
                        ? { ...user, relationship_status: "REQUEST_SENT" as any }
                        : user
                )
            );
        } catch (err: any) {
            console.error("Friend request error:", err.response?.data || err);
            setError(err.response?.data?.detail || "Failed to send friend request.");
            throw err;
        } finally {
            setLoading(false);
        }   
    }

    const acceptFriendRequest = async (requestId: number) => {
        setLoading(true);
        setError(null);

        console.log("Accepting friend request with ID:", requestId);
        
        // Optimistically remove request from list
        const removedRequest = friendRequests.find(r => r.request_id === requestId);
        setFriendRequests(prev => prev.filter(r => r.request_id !== requestId));

        try {
            console.log("Calling accept API...");
            await friendService.acceptFriendRequest(requestId);
            
            console.log("Accept successful, refreshing lists...");
            // Refresh both friend list and friend requests in parallel
            const [friendsRes, requestsRes] = await Promise.all([
                friendService.getFriendsList(),
                friendService.getFriendRequests()
            ]);
            
            setFriends(friendsRes.data);
            setFriendRequests(requestsRes.data);
            console.log("Lists refreshed successfully");
        } catch (err: any) {
            // rollback nếu lỗi
            console.error("Accept friend request error:", err.response?.data || err);
            console.error("Full error:", err);
            if (removedRequest) {
                setFriendRequests(prev => [...prev, removedRequest]);
            }
            setError(err.response?.data?.detail || "Failed to accept friend request.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const rejectFriendRequest = async (requestId: number) => {
        setLoading(true);
        setError(null);

        // Optimistically remove request from list
        const removedRequest = friendRequests.find(r => r.request_id === requestId);
        setFriendRequests(prev => prev.filter(r => r.request_id !== requestId));
        
        try {
            await friendService.rejectFriendRequest(requestId);
        } catch (err: any) {
            // rollback nếu lỗi
            console.error("Reject friend request error:", err.response?.data || err);
            if (removedRequest) {
                setFriendRequests(prev => [...prev, removedRequest]);
            }
            setError(err.response?.data?.detail || "Failed to reject friend request.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getFriendsList();
        getFriendRequests();
    }, []);

    
    return  {
        friends,
        searchResults,
        friendRequests,
        loading,
        error,
        getFriendsList,
        searchUsers,
        getFriendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
    }
}