export enum ReportSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}

export enum ReportCategory {
    BUG = "BUG",
    FEATURE_REQUEST = "FEATURE_REQUEST",
    CONTENT_ERROR = "CONTENT_ERROR",
    PERFORMANCE = "PERFORMANCE",
    ACCESSIBILITY = "ACCESSIBILITY",
    POST = "POST",
    OTHER = "OTHER"
}

export enum ReportStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
    WONT_FIX = "WONT_FIX"
}

export interface ReportCreate {
    title: string;
    description: string;
    severity: ReportSeverity;
    category: ReportCategory;
    affected_url?: string;
    affected_lesson_id?: number;
    affected_post_id?: number;
}

export interface Report {
    id: number;
    user_id: number;
    title: string;
    status: ReportStatus;
    severity: ReportSeverity;
    category: ReportCategory;
    resolved_by?: number;
    resolution_notes?: string;
    affected_url?: string;
    affected_lesson_id?: number;
    affected_post_id?: number;
    created_at: string;
    resolved_at: string;
}