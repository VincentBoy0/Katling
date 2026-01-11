import { api } from "@/lib/api";
import { Lesson, LessonSection, Topic, Question, LessonType, LessonStatus, QuestionType } from "@/types/content";

// ============ Type Definitions ============

// Topic Types
export interface TopicCreateRequest {
    name: string;
    description?: string;
    order_index?: number;
}

export interface TopicUpdateRequest {
    name?: string;
    description?: string;
    order_index?: number;
}

// Lesson Types
export interface LessonCreateRequest {
    topic_id: number;
    type: LessonType;
    title: string;
    description?: string;
    audio_url?: string;
    image_url?: string;
    content?: Record<string, any>;
    status?: LessonStatus;
    order_index?: number;
}

export interface LessonUpdateRequest {
    type?: LessonType;
    title?: string;
    description?: string;
    audio_url?: string;
    image_url?: string;
    content?: Record<string, any>;
    status?: LessonStatus;
    order_index?: number;
}

// Lesson Section Types
export interface LessonSectionCreateRequest {
    lesson_id: number;
    title: string;
    content?: Record<string, any>;
    order_index?: number;
}

export interface LessonSectionUpdateRequest {
    title?: string;
    content?: Record<string, any>;
    order_index?: number;
}

// Question Types
export interface QuestionCreateRequest {
    section_id: number;
    type: QuestionType;
    content?: Record<string, any>;
    correct_answer?: Record<string, any>;
    audio_url?: string;
    explanation?: string;
    order_index?: number;
}

export interface QuestionUpdateRequest {
    type?: QuestionType;
    content?: Record<string, any>;
    correct_answer?: Record<string, any>;
    audio_url?: string;
    explanation?: string;
    order_index?: number;
}

// Response Types
export interface MessageResponse {
    message: string;
}

export const contentService = {
    // ============ Topic Management ============
    
    /**
     * Get all topics (Admin/Moderator)
     */
    getAllTopics(params?: { skip?: number; limit?: number }) {
        return api.get<Topic[]>(`/admod/topics`, { params });
    },

    /**
     * Get topics by creator user ID (Admin/Moderator)
     */
    getTopicsByCreator(userId: number, params?: { skip?: number; limit?: number }) {
        return api.get<Topic[]>(`/admod/topics/creator/${userId}`, { params });
    },

    /**
     * Get a specific topic by ID (Admin/Moderator)
     */
    getTopicById(topicId: number) {
        return api.get<Topic>(`/admod/topics/${topicId}`);
    },

    /**
     * Create a new topic (Moderator)
     */
    createTopic(data: TopicCreateRequest) {
        return api.post<Topic>(`/moderator/topics`, data);
    },

    /**
     * Update an existing topic (Moderator)
     */
    updateTopic(topicId: number, data: TopicUpdateRequest) {
        return api.patch<Topic>(`/moderator/topics/${topicId}`, data);
    },

    /**
     * Delete a topic - soft delete (Moderator)
     */
    deleteTopic(topicId: number) {
        return api.delete<MessageResponse>(`/moderator/topics/${topicId}`);
    },

    /**
     * Restore a deleted topic (Moderator)
     */
    restoreTopic(topicId: number) {
        return api.post<Topic>(`/moderator/topics/${topicId}/restore`);
    },

    // ============ Lesson Management ============

    /**
     * Get all lessons (Admin/Moderator)
     */
    getAllLessons(params?: { skip?: number; limit?: number; include_deleted?: boolean }) {
        return api.get<Lesson[]>(`/admod/lessons`, { params });
    },

    /**
     * Get lessons by topic ID (Admin/Moderator)
     */
    getLessonsByTopic(topicId: number, params?: { skip?: number; limit?: number; include_deleted?: boolean }) {
        return api.get<Lesson[]>(`/admod/lessons/topic/${topicId}`, { params });
    },

    /**
     * Get lessons by creator user ID (Admin/Moderator)
     */
    getLessonsByCreator(userId: number, params?: { skip?: number; limit?: number; include_deleted?: boolean }) {
        return api.get<Lesson[]>(`/admod/lessons/creator/${userId}`, { params });
    },

    /**
     * Get a specific lesson by ID (Admin/Moderator)
     */
    getLessonById(lessonId: number, params?: { include_deleted?: boolean }) {
        return api.get<Lesson>(`/admod/lessons/${lessonId}`, { params });
    },

    /**
     * Create a new lesson (Moderator)
     */
    createLesson(data: LessonCreateRequest) {
        return api.post<Lesson>(`/moderator/lessons`, data);
    },

    /**
     * Update an existing lesson (Moderator)
     */
    updateLesson(lessonId: number, data: LessonUpdateRequest) {
        return api.patch<Lesson>(`/moderator/lessons/${lessonId}`, data);
    },

    /**
     * Delete a lesson - soft delete (Moderator)
     */
    deleteLesson(lessonId: number) {
        return api.delete<MessageResponse>(`/moderator/lessons/${lessonId}`);
    },

    /**
     * Restore a deleted lesson (Moderator)
     */
    restoreLesson(lessonId: number) {
        return api.post<Lesson>(`/moderator/lessons/${lessonId}/restore`);
    },

    // ============ Lesson Section Management ============

    /**
     * Get all lesson sections (Admin/Moderator)
     */
    getAllSections(params?: { skip?: number; limit?: number; include_deleted?: boolean }) {
        return api.get<LessonSection[]>(`/admod/lesson-sections`, { params });
    },

    /**
     * Get sections by lesson ID (Admin/Moderator)
     */
    getSectionsByLesson(lessonId: number, params?: { skip?: number; limit?: number; include_deleted?: boolean }) {
        return api.get<LessonSection[]>(`/admod/lesson-sections/lesson/${lessonId}`, { params });
    },

    /**
     * Get sections by creator user ID (Admin/Moderator)
     */
    getSectionsByCreator(userId: number, params?: { skip?: number; limit?: number; include_deleted?: boolean }) {
        return api.get<LessonSection[]>(`/admod/lesson-sections/creator/${userId}`, { params });
    },

    /**
     * Get a specific section by ID (Admin/Moderator)
     */
    getSectionById(sectionId: number, params?: { include_deleted?: boolean }) {
        return api.get<LessonSection>(`/admod/lesson-sections/${sectionId}`, { params });
    },

    /**
     * Create a new lesson section (Moderator)
     */
    createSection(data: LessonSectionCreateRequest) {
        return api.post<LessonSection>(`/moderator/lesson-sections`, data);
    },

    /**
     * Update an existing lesson section (Moderator)
     */
    updateSection(sectionId: number, data: LessonSectionUpdateRequest) {
        return api.patch<LessonSection>(`/moderator/lesson-sections/${sectionId}`, data);
    },

    /**
     * Delete a lesson section - soft delete (Moderator)
     */
    deleteSection(sectionId: number) {
        return api.delete<MessageResponse>(`/moderator/lesson-sections/${sectionId}`);
    },

    /**
     * Restore a deleted lesson section (Moderator)
     */
    restoreSection(sectionId: number) {
        return api.post<LessonSection>(`/moderator/lesson-sections/${sectionId}/restore`);
    },

    // ============ Question Management ============

    /**
     * Get all questions (Admin/Moderator)
     */
    getAllQuestions(params?: { skip?: number; limit?: number; include_deleted?: boolean }) {
        return api.get<Question[]>(`/admod/questions`, { params });
    },

    /**
     * Get questions by section ID (Admin/Moderator)
     */
    getQuestionsBySection(sectionId: number) {
        return api.get<Question[]>(`/admod/lesson-sections/${sectionId}/questions`);
    },

    /**
     * Get a specific question by ID (Admin/Moderator)
     */
    getQuestionById(questionId: number) {
        return api.get<Question>(`/admod/questions/${questionId}`);
    },

    /**
     * Create a new question (Moderator)
     */
    createQuestion(data: QuestionCreateRequest) {
        return api.post<Question>(`/moderator/questions`, data);
    },

    /**
     * Update an existing question (Moderator)
     */
    updateQuestion(questionId: number, data: QuestionUpdateRequest) {
        return api.patch<Question>(`/moderator/questions/${questionId}`, data);
    },

    /**
     * Delete a question - soft delete (Moderator)
     */
    deleteQuestion(questionId: number) {
        return api.delete<MessageResponse>(`/admod/questions/${questionId}`);
    },

    /**
     * Restore a deleted question (Moderator)
     */
    restoreQuestion(questionId: number) {
        return api.post<Question>(`/admod/questions/${questionId}/restore`);
    },
};