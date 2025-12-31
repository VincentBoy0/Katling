"use client";

import { useState } from "react";
import ModeratorHeader from "@/components/moderator/Header";
import ModeratorSidebar from "@/components/moderator/Sidebar";
import ModeratorOverview from "@/pages/moderator/dashboard/Overview";
import CreateContent from "@/pages/moderator/dashboard/create-content";
import ReviewQueue from "@/pages/moderator/dashboard/review-queue";
import UserReports from "@/pages/moderator/dashboard/user-reports";
import AppealsDashboard from "@/pages/moderator/dashboard/appeals-dashboard";
import ModeratorSettings from "@/pages/moderator/dashboard/Settings";

export default function ModeratorPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <ModeratorOverview />;
      case "create":
        return <CreateContent />;
      case "review":
        return <ReviewQueue />;
      case "reports":
        return <UserReports />;
      case "appeals":
        return <AppealsDashboard />;
      // 2. Thêm case settings
      case "settings":
        return <ModeratorSettings />;
      default:
        return <ModeratorOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      <ModeratorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 3. Truyền onNavigate để header điều khiển được tab */}
        <ModeratorHeader onNavigate={setActiveTab} />
        <main className="flex-1 overflow-auto bg-muted/10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
