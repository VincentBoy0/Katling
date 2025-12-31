"use client";

import { useState } from "react";
import ModeratorHeader from "@/components/moderator/moderator-header";
import ModeratorSidebar from "@/components/moderator/moderator-sidebar";
import ModeratorOverview from "@/components/moderator/moderator-overview";
import CreateContent from "@/components/moderator/create-content";
import ReviewQueue from "@/components/moderator/review-queue";
import UserReports from "@/components/moderator/user-reports";
import AppealsDashboard from "@/components/moderator/appeals-dashboard";
import ModeratorSettings from "@/components/moderator/moderator-settings";

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
