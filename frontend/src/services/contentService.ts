import { api } from "@/lib/api";
import { Lesson, LessonSection, Topic } from "@/types/content";
import { Question } from "@/types/learning";

export const contentService = {
    getTopicsByCreator(userId: number, params? : {skip? : number; limit? : number;}) {
        return api.get<Topic[]>(`/admod/topics/creator/${userId}`, {params});
    },

    getAllTopics(params? : {skip? : number; limit? : number;}) {
        return api.get<Topic[]>(`/admod/topics`, {params});
    },

    getTopicById(topicId: number) {
        return api.get<Topic>(`/admod/topics/${topicId}`);
    },

    getAllLessons(params? : {skip? : number; limit? : number; include_deleted? : boolean}) {
        return api.get<Lesson[]>(`/admod/lessons`, {params});
    },

    getLessonsByTopic(topicId: number, params? : {skip? : number; limit? : number; include_deleted? : boolean}) {
        return api.get<Lesson[]>(`/admod/lessons/topic/${topicId}`, {params});
    },

    getLessonsByCreator(userId: number, params? : {skip?:number; limit?: number; include_deleted?: boolean}) {
        return api.get<Lesson[]>(`/admod/lessons/creator/${userId}`, {params});
    },

    getLessonById(lessonId: number, params?:{include_deleted?: boolean;}) {
        return api.get<Lesson>(`/admod/lessons/${lessonId}`, {params});
    },

    getAllSections(params?: {skip?:number, limit?:number; include_deleted?:boolean}) {
        return api.get<LessonSection[]>(`/admod/lesson-sections`, {params});
    },

    getSectionsByLesson(lessonId: number, params?: {skip?:number; limit?:number; include_deleted?:boolean}) {
        return api.get<LessonSection[]>(`/admod/lesson-sections/lesson/${lessonId}`, {params});
    },

    getSectionsByCreator(userId: number, params?: {skip?:number; limit?: number; include_deleted?: boolean;}) {
        return api.get<LessonSection[]>(`/admod/lesson-sections/creator/${userId}`, {params});
    },

    getSectionById(sectionId: number, params?: {include_deleted?:boolean;}) {
        return api.get<LessonSection>(`/admod/lesson-sections/${sectionId}`, {params});
    },

    getQuestionById(questionId: number) {
        return api.get<Question>(`/admod/questions/${questionId}`);
    },

    getQuestionsBySection(sectionId: number) {
        return api.get<Question[]>(`/admod/lesson-sections/${sectionId}/questions`);
    },

    deleteQuestion(questionId: number) {
        return api.delete<Record<string, string>>(`/admod/questions/${questionId}`);
    },

    restoreQuestion(questionId: number) {
        return api.post<Question>(`/admod/questions/${questionId}/restore`)
    },

    getAllQuestions(params?: {skip?: number; limit?: number; include_deleted?: boolean}) {
        return api.get<Question[]>(`/admod/questions/`, {params});
    }
}