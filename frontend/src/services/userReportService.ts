import { api } from "@/lib/api";
import { ReportCreate, Report } from "@/types/report";

export const reportService = {
    async createReport(reportCreate: ReportCreate) {
        const res = await api.post<Report>("/reports", reportCreate);
        return res.data;
    },
}