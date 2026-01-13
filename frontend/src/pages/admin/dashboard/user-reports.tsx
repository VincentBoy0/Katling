import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Eye,
  Filter,
  RefreshCw,
  FileText,
  Bug,
  Lightbulb,
  Zap,
  Accessibility,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  reportService,
  ReportListItem,
  ReportStatus,
  ReportSeverity,
  ReportCategory,
  Report,
  ReportStats,
  ReportStatusLabels,
  ReportSeverityLabels,
  ReportCategoryLabels,
} from "@/services/reportService";
import { toast } from "sonner";

// Admin can see ALL categories including POST
const ALL_CATEGORIES = Object.values(ReportCategory);

export default function UserReports() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    fetchReportsAndStats();
  }, [filterStatus, filterSeverity, filterCategory]);

  const fetchReportsAndStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterSeverity !== "all") params.severity = filterSeverity;
      if (filterCategory !== "all") params.category = filterCategory;

      const [reportsResponse, statsResponse] = await Promise.all([
        reportService.getAllReports(params),
        reportService.getReportStats(),
      ]);

      // Admin sees ALL reports (no filtering)
      setReports(reportsResponse.data);
      setStats(statsResponse.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Không thể tải báo cáo"
      );
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (reportId: number) => {
    try {
      const response = await reportService.getReportById(reportId);
      setSelectedReport(response.data);
      setResolutionNotes("");
      setShowDetailModal(true);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Không thể tải chi tiết báo cáo"
      );
    }
  };

  const handleUpdateStatus = async (reportId: number, status: ReportStatus) => {
    try {
      setActionLoading(true);
      await reportService.updateReport(reportId, { status });
      toast.success("Cập nhật trạng thái thành công!");
      await fetchReportsAndStats();
      if (selectedReport) {
        setSelectedReport({ ...selectedReport, status });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Không thể cập nhật báo cáo");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (reportId: number) => {
    try {
      setActionLoading(true);
      await reportService.resolveReport(reportId, resolutionNotes || undefined);
      toast.success("Báo cáo đã được giải quyết!");
      await fetchReportsAndStats();
      setShowDetailModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Không thể giải quyết báo cáo");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (reportId: number) => {
    try {
      setActionLoading(true);
      await reportService.closeReport(reportId, resolutionNotes || undefined);
      toast.success("Báo cáo đã được đóng!");
      await fetchReportsAndStats();
      setShowDetailModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Không thể đóng báo cáo");
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityColor = (severity: ReportSeverity) => {
    const colors = {
      [ReportSeverity.CRITICAL]: "bg-red-600/20 text-red-600 border-red-600/30",
      [ReportSeverity.HIGH]:
        "bg-orange-500/20 text-orange-600 border-orange-500/30",
      [ReportSeverity.MEDIUM]:
        "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      [ReportSeverity.LOW]: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    };
    return colors[severity] || "bg-muted text-muted-foreground";
  };

  const getStatusColor = (status: ReportStatus) => {
    const colors = {
      [ReportStatus.PENDING]:
        "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      [ReportStatus.IN_PROGRESS]:
        "bg-blue-500/20 text-blue-600 border-blue-500/30",
      [ReportStatus.RESOLVED]:
        "bg-green-500/20 text-green-600 border-green-500/30",
      [ReportStatus.CLOSED]: "bg-gray-500/20 text-gray-600 border-gray-500/30",
      [ReportStatus.WONT_FIX]:
        "bg-purple-500/20 text-purple-600 border-purple-500/30",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const getCategoryIcon = (category: ReportCategory) => {
    const icons = {
      [ReportCategory.BUG]: <Bug className="w-4 h-4" />,
      [ReportCategory.FEATURE_REQUEST]: <Lightbulb className="w-4 h-4" />,
      [ReportCategory.CONTENT_ERROR]: <FileText className="w-4 h-4" />,
      [ReportCategory.PERFORMANCE]: <Zap className="w-4 h-4" />,
      [ReportCategory.ACCESSIBILITY]: <Accessibility className="w-4 h-4" />,
      [ReportCategory.POST]: <MessageSquare className="w-4 h-4" />,
      [ReportCategory.OTHER]: <HelpCircle className="w-4 h-4" />,
    };
    return icons[category] || <HelpCircle className="w-4 h-4" />;
  };

  const getCategoryColor = (category: ReportCategory) => {
    if (category === ReportCategory.POST) {
      return "bg-pink-500/20 text-pink-600 border-pink-500/30";
    }
    return "bg-muted text-foreground border-border";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Count POST reports
  const postReportsCount = reports.filter(
    (r) => r.category === ReportCategory.POST
  ).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Quản lý báo cáo
            </h2>
            <p className="text-muted-foreground mt-1">
              Xem và xử lý tất cả các loại báo cáo từ người dùng
            </p>
          </div>
          <button
            onClick={fetchReportsAndStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng báo cáo</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.total_reports}
                  </p>
                </div>
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending_count}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đang xử lý</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.in_progress_count}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đã giải quyết</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.by_status.RESOLVED || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-pink-500/30 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Báo cáo bài viết
                  </p>
                  <p className="text-2xl font-bold text-pink-600">
                    {postReportsCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="all">Tất cả trạng thái</option>
                {Object.values(ReportStatus).map((status) => (
                  <option key={status} value={status}>
                    {ReportStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Mức độ
              </label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="all">Tất cả mức độ</option>
                {Object.values(ReportSeverity).map((severity) => (
                  <option key={severity} value={severity}>
                    {ReportSeverityLabels[severity]}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter - Admin sees ALL including POST */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Danh mục
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="all">Tất cả danh mục</option>
                {ALL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {ReportCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Đang tải báo cáo...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-600 font-medium">Lỗi: {error}</p>
          <button
            onClick={fetchReportsAndStats}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Không tìm thấy báo cáo nào
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Thử thay đổi bộ lọc để xem thêm kết quả
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`bg-card border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer ${
                report.category === ReportCategory.POST
                  ? "border-pink-500/30"
                  : "border-border"
              }`}
              onClick={() => handleViewDetails(report.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-sm font-mono text-muted-foreground">
                      #{report.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {ReportStatusLabels[report.status]}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${getSeverityColor(
                        report.severity
                      )}`}
                    >
                      {ReportSeverityLabels[report.severity]}
                    </span>
                    {report.category === ReportCategory.POST && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border bg-pink-500/20 text-pink-600 border-pink-500/30">
                        <MessageSquare className="w-3 h-3" />
                        Bài viết
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {report.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {getCategoryIcon(report.category)}
                      {ReportCategoryLabels[report.category]}
                    </span>
                    <span>{formatDate(report.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(report.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  Chi tiết báo cáo
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  ID: #{selectedReport.id}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Severity Badges */}
              <div className="flex flex-wrap gap-3">
                <span
                  className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(
                    selectedReport.status
                  )}`}
                >
                  {ReportStatusLabels[selectedReport.status]}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full border ${getSeverityColor(
                    selectedReport.severity
                  )}`}
                >
                  {ReportSeverityLabels[selectedReport.severity]}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full border ${getCategoryColor(
                    selectedReport.category
                  )}`}
                >
                  {getCategoryIcon(selectedReport.category)}
                  {ReportCategoryLabels[selectedReport.category]}
                </span>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  Tiêu đề
                </label>
                <p className="text-lg font-medium text-foreground">
                  {selectedReport.title}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  Mô tả chi tiết
                </label>
                <div className="text-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {selectedReport.description}
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-1">
                    Người báo cáo
                  </label>
                  <p className="text-foreground">
                    ID: {selectedReport.user_id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-1">
                    Thời gian tạo
                  </label>
                  <p className="text-foreground">
                    {formatDate(selectedReport.created_at)}
                  </p>
                </div>
              </div>

              {selectedReport.affected_url && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">
                    URL bị ảnh hưởng
                  </label>
                  <a
                    href={selectedReport.affected_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {selectedReport.affected_url}
                  </a>
                </div>
              )}

              {selectedReport.affected_lesson_id && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">
                    Bài học liên quan
                  </label>
                  <p className="text-foreground">
                    ID: {selectedReport.affected_lesson_id}
                  </p>
                </div>
              )}

              {selectedReport.affected_post_id && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">
                    Bài viết bị báo cáo
                  </label>
                  <p className="text-foreground">
                    ID: {selectedReport.affected_post_id}
                  </p>
                </div>
              )}

              {selectedReport.resolution_notes && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">
                    Ghi chú giải quyết
                  </label>
                  <div className="text-foreground bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                    {selectedReport.resolution_notes}
                  </div>
                </div>
              )}

              {/* Resolution Notes Input */}
              {selectedReport.status !== ReportStatus.RESOLVED &&
                selectedReport.status !== ReportStatus.CLOSED && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground block mb-2">
                      Ghi chú xử lý (tùy chọn)
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Nhập ghi chú về cách xử lý báo cáo này..."
                      className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                      rows={3}
                    />
                  </div>
                )}

              {/* Actions */}
              <div className="border-t border-border pt-6">
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  Hành động
                </label>
                <div className="flex flex-wrap gap-3">
                  {selectedReport.status === ReportStatus.PENDING && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedReport.id,
                          ReportStatus.IN_PROGRESS
                        )
                      }
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
                    >
                      Bắt đầu xử lý
                    </button>
                  )}
                  {selectedReport.status !== ReportStatus.RESOLVED &&
                    selectedReport.status !== ReportStatus.CLOSED && (
                      <>
                        <button
                          onClick={() => handleResolve(selectedReport.id)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
                        >
                          Đánh dấu đã giải quyết
                        </button>
                        <button
                          onClick={() => handleClose(selectedReport.id)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium"
                        >
                          Đóng báo cáo
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              selectedReport.id,
                              ReportStatus.WONT_FIX
                            )
                          }
                          disabled={actionLoading}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 font-medium"
                        >
                          Không sửa
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
