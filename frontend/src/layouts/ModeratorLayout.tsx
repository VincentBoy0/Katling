import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";

export default function ModeratorLayout() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    if (role !== "moderator" && role !== "admin") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, role, navigate]);

  if (!isAuthenticated || (role !== "moderator" && role !== "admin")) {
    return null;
  }

  return <Outlet />;
}
