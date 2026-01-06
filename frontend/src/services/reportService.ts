import { api } from "@/lib/api";

// ============ Type Definitions ============

export enum ReportStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  WONT_FIX = "WONT_FIX",
}

export enum ReportSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum ReportCategory {
  BUG = "BUG",
  FEATURE_REQUEST = "FEATURE_REQUEST",
  CONTENT_ERROR = "CONTENT_ERROR",
  PERFORMANCE = "PERFORMANCE",
  ACCESSIBILITY = "ACCESSIBILITY",
  OTHER = "OTHER",
}

export interface ReportCreate {
  title: string;
  description: string;
  severity?: ReportSeverity;
  category?: ReportCategory;
  affected_url?: string;
  affected_lesson_id?: number;
}

export interface ReportUpdate {
  status?: ReportStatus;
  severity?: ReportSeverity;
  resolution_notes?: string;
}

export interface Report {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: ReportStatus;
  severity: ReportSeverity;
  category: ReportCategory;
  affected_url?: string;
  affected_lesson_id?: number;
  resolved_by?: number;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface ReportListItem {
  id: number;
  title: string;
  status: ReportStatus;
  severity: ReportSeverity;
  category: ReportCategory;
  created_at: string;
  resolved_at?: string;
}

export interface ReportStats {
  total_reports: number;
  by_status: Record<string, number>;
  pending_count: number;
  in_progress_count: number;
}

export const reportService = {
  // ============ Management Endpoints (Admin/Moderator) ============

  /**
   * Get all reports with filters (Admin/Moderator)
   */
  getAllReports(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    severity?: string;
    category?: string;
  }) {
    return api.get<ReportListItem[]>("/management/reports", { params });
  },

  /**
   * Get detailed information about a specific report (Admin/Moderator)
   */
  getReportById(reportId: number) {
    return api.get<Report>(`/management/reports/${reportId}`);
  },

  /**
   * Update a report's status, severity, or resolution notes (Admin/Moderator)
   */
  updateReport(reportId: number, data: ReportUpdate) {
    return api.patch<Report>(`/management/reports/${reportId}`, data);
  },

  /**
   * Mark a report as resolved (Admin/Moderator)
   */
  resolveReport(reportId: number, resolutionNotes?: string) {
    return api.patch<Report>(`/management/reports/${reportId}/resolve`, null, {
      params: { resolution_notes: resolutionNotes },
    });
  },

  /**
   * Mark a report as closed (Admin/Moderator)
   */
  closeReport(reportId: number, resolutionNotes?: string) {
    return api.patch<Report>(`/management/reports/${reportId}/close`, null, {
      params: { resolution_notes: resolutionNotes },
    });
  },

  /**
   * Get report statistics summary (Admin/Moderator)
   */
  getReportStats() {
    return api.get<ReportStats>("/management/reports/stats/summary");
  },

  // ============ User Endpoints ============

  /**
   * Create a new report (User)
   */
  createReport(data: ReportCreate) {
    return api.post<Report>("/reports", data);
  },
};
