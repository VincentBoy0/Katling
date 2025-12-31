import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { Sidebar } from "@/components/learner/sidebar";
import { TopBar } from "@/components/learner/top-bar";
import { useAuth } from "@/context/auth-context";

export default function LearnerLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
