"use client";

import { Button } from "@/components/learner/button";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { Moon, Sun } from "lucide-react";

export function TopBar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{user?.displayName}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-secondary/10 rounded-lg px-4 py-2">
          <span className="text-sm">Level {user?.level}</span>
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
            {user?.exp} EXP
          </span>
        </div>

        <div className="flex items-center gap-2 bg-warning/10 rounded-lg px-4 py-2">
          <Zap className="w-4 h-4 text-warning" />
          <span className="text-sm">
            {user?.energy}/{user?.maxEnergy}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Chuyển chế độ"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

import { Zap } from "lucide-react";
