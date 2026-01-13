import { api } from "@/lib/api"
import {
    RoleAssign,
    RoleType,
    User,
    UserInfo,
    UserInfoUpdate,
    UserRole,
    UserRoleCheck,
    UserRoleList,
    UserUpdate
} from "@/types/user"
import { Topic, Lesson, LessonSection, Question, LessonStatus } from "@/types/content"
import { AdminPostListResponse, PostStatus, PostStatsResponse } from "@/types/post"

export const adminService = {
    // GET /admin/users
    getUsers(params?: { skip?: number; limit?: number }) {
        return api.get<User[]>("/admin/users", { params })
    },

    // GET /admin/users/{userId}
    getUserById(userId: number) {
        return api.get<User>(`/admin/users/${userId}`)
    },

    // GET /admin/users/{userId}/profile
    getUserProfileById(userId: number) {
        return api.get<UserInfo>(`/admin/users/${userId}/profile`)
    },

    // PATCH /admin/users/{userId}
    updateUserById(userId: number, data: UserUpdate) {
        return api.patch<User>(`/admin/users/${userId}`, data)
    },

    // PATCH /admin/users/{userId}/profile
    updateUserProfileById(userId: number, data: UserInfoUpdate) {
        return api.patch<UserInfo>(`/admin/users/${userId}/profile`, data)
    },

    // POST /admin/users/{userId}/ban
    banUserById(userId: number) {
        return api.post<void>(`/admin/users/${userId}/ban`)
    },

    // POST /admin/users/{userId}/unban
    unbanUserById(userId: number) {
        return api.post<void>(`/admin/users/${userId}/unban`)
    },

    // DELETE /admin/users/{userId}
    deleteUserById(userId: number) {
        return api.delete<void>(`/admin/users/${userId}`)
    },

    assignRole(userId: number, { role_type }: RoleAssign) {
        return api.post<UserRole>(`/admin/users/${userId}/roles`, { role_type })
    },

    removeRole(userId: number, roleType: RoleType) {
        return api.delete<void>(`/admin/users/${userId}/roles/${roleType}`)
    },

    getUserRoles(userId: number) {
        return api.get<UserRoleList>(`/admin/users/${userId}/roles`)
    },

    checkUserRole(userId: number, roleType: RoleType) {
        return api.get<UserRoleCheck>(`/admin/users/${userId}/roles/${roleType}`)
    },

    // ============ Content Status Management ============
    
    // PATCH /admin/topic/{topicId}
    updateTopicStatus(topicId: number, status: LessonStatus) {
        return api.patch<Topic>(`/admin/topic/${topicId}`, null, { params: { status } })
    },

    // PATCH /admin/lesson/{lessonId}
    updateLessonStatus(lessonId: number, status: LessonStatus) {
        return api.patch<Lesson>(`/admin/lesson/${lessonId}`, null, { params: { status } })
    },

    // PATCH /admin/section/{sectionId}
    updateSectionStatus(sectionId: number, status: LessonStatus) {
        return api.patch<LessonSection>(`/admin/section/${sectionId}`, null, { params: { status } })
    },

    // PATCH /admin/question/{questionId}
    updateQuestionStatus(questionId: number, status: LessonStatus) {
        return api.patch<Question>(`/admin/question/${questionId}`, null, { params: { status } })
    },

    // ============ Post Management ============

    // GET /admin/posts
    getPosts(params?: { skip?: number; limit?: number; status?: PostStatus; user_id?: number }) {
        return api.get<AdminPostListResponse>("/admin/posts", { params })
    },

    // GET /admin/posts/stats
    getPostsStats() {
        return api.get<PostStatsResponse>("/admin/posts/stats")
    },

    // PATCH /admin/posts/{postId}/status
    updatePostStatus(postId: number, status: PostStatus) {
        return api.patch(`/admin/posts/${postId}/status`, { status })
    },

    // DELETE /admin/posts/{postId}
    deletePost(postId: number, hardDelete: boolean = false) {
        return api.delete<void>(`/admin/posts/${postId}`, { params: { hard_delete: hardDelete } })
    },

    // POST /admin/posts/bulk-delete
    bulkDeletePosts(postIds: number[], hardDelete: boolean = false) {
        return api.post<void>("/admin/posts/bulk-delete", { post_ids: postIds }, { params: { hard_delete: hardDelete } })
    },

    // DELETE /admin/comments/{commentId}
    deleteComment(commentId: number, hardDelete: boolean = false) {
        return api.delete<void>(`/admin/comments/${commentId}`, { params: { hard_delete: hardDelete } })
    },
}
