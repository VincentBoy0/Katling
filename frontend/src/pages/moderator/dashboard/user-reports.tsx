import { AlertCircle, CheckCircle, Clock, X, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import {
  reportService,
  ReportListItem,
  ReportStatus,
  ReportSeverity,
  Report,
  ReportStats,
} from "@/services/reportService";

export default function UserReports() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReportsAndStats();
  }, [filterStatus, filterSeverity]);

  const fetchReportsAndStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterSeverity !== "all") params.severity = filterSeverity;

      const [reportsResponse, statsResponse] = await Promise.all([
        reportService.getAllReports(params),
        reportService.getReportStats(),
      ]);

      setReports(reportsResponse.data);
      setStats(statsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch reports");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (reportId: number) => {
    try {
      const response = await reportService.getReportById(reportId);
      setSelectedReport(response.data);
      setShowDetailModal(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to fetch report details");
    }
  };

  const handleUpdateStatus = async (reportId: number, status: ReportStatus) => {
    try {
      setActionLoading(true);
      await reportService.updateReport(reportId, { status });
      await fetchReportsAndStats();
      setShowDetailModal(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (reportId: number, notes?: string) => {
    try {
      setActionLoading(true);
      await reportService.resolveReport(reportId, notes);
      await fetchReportsAndStats();
      setShowDetailModal(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to resolve report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (reportId: number, notes?: string) => {
    try {
      setActionLoading(true);
      await reportService.closeReport(reportId, notes);
      await fetchReportsAndStats();
      setShowDetailModal(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to close report");
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityColor = (severity: ReportSeverity) => {
    const colors = {
      [ReportSeverity.CRITICAL]: "bg-red-600/20 text-red-600",
      [ReportSeverity.HIGH]: "bg-orange-500/20 text-orange-600",
      [ReportSeverity.MEDIUM]: "bg-yellow-500/20 text-yellow-600",
      [ReportSeverity.LOW]: "bg-blue-500/20 text-blue-600",
    };
    return colors[severity] || "bg-muted text-muted-foreground";
  };

  const getStatusColor = (status: ReportStatus) => {
    const colors = {
      [ReportStatus.PENDING]: "bg-yellow-500/20 text-yellow-600",
      [ReportStatus.IN_PROGRESS]: "bg-blue-500/20 text-blue-600",
      [ReportStatus.RESOLVED]: "bg-green-500/20 text-green-600",
      [ReportStatus.CLOSED]: "bg-gray-500/20 text-gray-600",
      [ReportStatus.WONT_FIX]: "bg-purple-500/20 text-purple-600",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-8">
      {/* Header with Stats */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">User Reports</h2>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total_reports}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending_count}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.in_progress_count}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.by_status.RESOLVED || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <span className="text-sm font-semibold text-foreground self-center">Status:</span>
            {["all", ...Object.values(ReportStatus)].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {status === "all" ? "All" : status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="text-sm font-semibold text-foreground self-center">Severity:</span>
            {["all", ...Object.values(ReportSeverity)].map((severity) => (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  filterSeverity === severity
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {severity === "all" ? "All" : severity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading reports...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={fetchReportsAndStats}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No reports found</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Severity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">#{report.id}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground font-medium">{report.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-foreground">
                        {report.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(report.created_at)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(report.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-sm font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Report Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Info */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Report ID</label>
                <p className="text-lg font-mono text-foreground">#{selectedReport.id}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground">Title</label>
                <p className="text-lg text-foreground">{selectedReport.title}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground">Description</label>
                <p className="text-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Category</label>
                  <p className="text-foreground">{selectedReport.category.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Severity</label>
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getSeverityColor(selectedReport.severity)}`}>
                    {selectedReport.severity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Status</label>
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Created At</label>
                  <p className="text-foreground">{formatDate(selectedReport.created_at)}</p>
                </div>
              </div>

              {selectedReport.affected_url && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Affected URL</label>
                  <p className="text-blue-600 break-all">{selectedReport.affected_url}</p>
                </div>
              )}

              {selectedReport.resolution_notes && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Resolution Notes</label>
                  <p className="text-foreground bg-green-500/10 p-4 rounded-lg">
                    {selectedReport.resolution_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-border pt-6">
                <label className="text-sm font-semibold text-foreground mb-3 block">Actions</label>
                <div className="flex flex-wrap gap-3">
                  {selectedReport.status === ReportStatus.PENDING && (
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, ReportStatus.IN_PROGRESS)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Start Investigation
                    </button>
                  )}
                  {selectedReport.status !== ReportStatus.RESOLVED && selectedReport.status !== ReportStatus.CLOSED && (
                    <>
                      <button
                        onClick={() => {
                          const notes = prompt("Resolution notes (optional):");
                          if (notes !== null) handleResolve(selectedReport.id, notes || undefined);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        Mark as Resolved
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt("Closure notes (optional):");
                          if (notes !== null) handleClose(selectedReport.id, notes || undefined);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        Close Report
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
