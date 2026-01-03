import { Card } from "@/components/ui/card";
import { Bell, Smartphone } from "lucide-react";
import SettingItem from "./SettingItem";

interface GeneralSettingsSectionProps {
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  appVersion?: string;
}

export default function GeneralSettingsSection({
  notifications,
  setNotifications,
  appVersion = "Katling v1.0.2 (Beta)",
}: GeneralSettingsSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground ml-1">Cài đặt chung</h2>
      <Card className="border-2 border-border rounded-2xl overflow-hidden bg-card">
        <SettingItem
          icon={Bell}
          iconColorClass="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
          title="Nhắc nhở học tập"
          description="Thông báo đẩy hằng ngày"
          checked={notifications}
          onCheckedChange={setNotifications}
          hasBorder={true}
        />

        <SettingItem
          icon={Smartphone}
          iconColorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
          title="Phiên bản ứng dụng"
          description={appVersion}
          type="info"
          infoText="Mới nhất"
        />
      </Card>
    </section>
  );
}
