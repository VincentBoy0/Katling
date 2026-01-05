import { useState } from "react";

import AnalyticsReporting from "@/pages/admin/dashboard/analytics-reporting";
import ContentLibrary from "@/pages/admin/dashboard/content-library";
import ErrorChecking from "@/pages/admin/dashboard/error-checking";
import AdminHeader from "@/components/admin/Header";
import OverviewDashboard from "@/pages/admin/dashboard/overview-dashboard";
import PostApproval from "@/pages/admin/dashboard/post-approval";
import AdminSettings from "@/pages/admin/dashboard/Settings";
import AdminSidebar from "@/components/admin/Sidebar";
import UserManagement from "@/pages/admin/dashboard/user-management";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewDashboard />;
      case "users":
        return <UserManagement />;
      // case "approval":
      //   return <PostApproval />;
      case "library":
        return <ContentLibrary />;
      case "errors":
        return <ErrorChecking />;
      case "analytics":
        return <AnalyticsReporting />;
      case "settings":
        return <AdminSettings />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      {/* Sidebar nằm bên trái */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Khu vực nội dung chính nằm bên phải */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header nằm ở trên cùng của khu vực nội dung */}
        <AdminHeader onNavigate={setActiveTab} />

        {/* Phần nội dung thay đổi theo Tab */}
        <main className="flex-1 overflow-auto bg-muted/10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
