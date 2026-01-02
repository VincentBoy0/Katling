import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface AccountSectionProps {
  displayName: string;
  email: string;
}

export default function AccountSection({
  displayName,
  email,
}: AccountSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground ml-1">Tài khoản</h2>
      <Card className="p-4 md:p-6 border-2 border-indigo-200 dark:border-indigo-900 bg-card rounded-2xl">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-black border-4 border-white dark:border-slate-800 shadow-sm shrink-0">
            {displayName.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate">{displayName}</h3>
            <p className="text-muted-foreground truncate">{email}</p>
          </div>

          <Link to="/dashboard/profile">
            <Button
              variant="outline"
              className="hidden md:flex font-bold border-2"
            >
              Chỉnh sửa
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
