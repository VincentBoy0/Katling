export enum LessonType {
    READING = "READING",           
    LISTENING = "LISTENING",       
    SPEAKING = "SPEAKING",         
    WRITING = "WRITING",           
    VOCABULARY = "VOCABULARY",     
    GRAMMAR = "GRAMMAR",           
    TEST = "TEST"
}

export enum LessonStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
    REJECTED = "REJECTED",
}

export enum QuestionType {
    MCQ = "MCQ",                   
    MULTIPLE_SELECT = "MULTIPLE_SELECT", 
    TRUE_FALSE = "TRUE_FALSE",     
    FILL_IN_THE_BLANK = "FILL_IN_THE_BLANK", 
    MATCHING = "MATCHING",         
    ORDERING = "ORDERING",         
    PRONUNCIATION = "PRONUNCIATION", 
    TRANSCRIPT = "TRANSCRIPT",
}

export interface Topic {
    id: number;
    created_by: number;
    name: string;
    description?: string;
    order_index: number;
    status?: LessonStatus;
    created_at: string;
    is_deleted: boolean;
}

export interface Lesson {
    id: number;
    topic_id: number;
    created_by: number;
    type: LessonType;
    title: string;
    description?: string;
    audio_url?: string;
    image_url?: string;
    content?: Record<string, any>;
    status: LessonStatus;
    order_index: number;
    created_at: string;
    is_deleted: boolean;
}

export interface LessonSection {
    id?: number;
    created_by: number;
    lesson_id: number;
    title: string;
    order_index: number;
    content?: Record<string, any>
    status?: LessonStatus;
    created_at: string;
    is_deleted: boolean;
}

export interface Question {
    id?: number;
    created_by: number;
    section_id: number;
    type: QuestionType;
    content?: Record<string, any>;
    correct_answer?: Record<string, any>;
    audio_url?: string;
    explanation?: string;
    order_index: number;
    status?: LessonStatus;
    created_at: string;
    is_deleted: boolean;
}