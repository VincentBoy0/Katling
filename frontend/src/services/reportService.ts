import { api } from "@/lib/api";
import { ReportCreate } from "@/types/report";

export const reportService = {
    createReport(reportCreate: ReportCreate) {
        return api.post<Report>("/reports", reportCreate);
    },
}