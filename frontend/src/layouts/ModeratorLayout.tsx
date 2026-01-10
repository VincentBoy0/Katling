import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { RoleType } from "@/types/user";
import ModeratorHeader from "@/components/moderator/Header";
import ModeratorSidebar from "@/components/moderator/Sidebar";

export default function ModeratorLayout() {
  const { isAuthenticated, roles, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("create");

  // Determine active tab from current route
  useEffect(() => {
    const path = location.pathname;
    if (
      path.includes("/topics/") ||
      path.includes("/lessons/") ||
      path.includes("/sections/") ||
      path === "/moderator" ||
      path === "/moderator/"
    ) {
      setActiveTab("create");
    } else if (path.includes("/reports")) {
      setActiveTab("reports");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/moderator/login", { replace: true });
      return;
    }

    // Moderator or Admin can access
    if (
      !roles.includes(RoleType.MODERATOR) &&
      !roles.includes(RoleType.ADMIN)
    ) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, roles, isLoading, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    (!roles.includes(RoleType.MODERATOR) && !roles.includes(RoleType.ADMIN))
  ) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      <ModeratorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ModeratorHeader onNavigate={setActiveTab} />
        <main className="flex-1 overflow-auto bg-muted/10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
