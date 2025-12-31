import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";

export default function AdminLayout() {
  const { isAuthenticated, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, role, navigate]);

  if (!isAuthenticated || role !== "admin") {
    return null;
  }

  return <Outlet />;
}
