import { useState } from "react";
import { ReportCreate, Report } from "@/types/report";
import { reportService } from "@/services/reportService";

export function useReport() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createReport = async (data: ReportCreate): Promise<Report> => {
        try {
            setLoading(true);
            setError(null);

            const response = await reportService.createReport(data);
            return response.data;
        } catch (err: any) {
            const message =
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to create report";

            setError(message);
            throw new Error(message);
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