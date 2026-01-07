import { useState } from "react";
import { ReportCreate, Report } from "@/types/report";
import { reportService } from "@/services/reportService";

export function useReport() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createReport = async (data: ReportCreate): Promise<Report | null> => {
    try {
        setLoading(true);
        setError(null);

        const report = await reportService.createReport(data);
        return report;

        } catch (err: any) {
        const message =
            err?.response?.data?.detail ||
            err?.message ||
            "Failed to create report";

        setError(message);
        return null;
        } finally {
        setLoading(false);
        }
    };

    return {
        createReport,
        loading,
        error,
    };
}