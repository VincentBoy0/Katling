import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { RoleType } from "@/types/user";

export default function AdminLayout() {
  const { isAuthenticated, roles, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/admin/login", { replace: true });
      return;
    }

    if (!roles.includes(RoleType.ADMIN)) {
      // Not an admin, redirect based on their role
      if (roles.includes(RoleType.MODERATOR)) {
        navigate("/moderator", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
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

  if (!isAuthenticated || !roles.includes(RoleType.ADMIN)) {
    return null;
  }

  return <Outlet />;
}
