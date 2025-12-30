import type React from "react";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
