import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useUserInfo } from "@/hooks/useUserInfo";

// Components
import SettingsHeader from "@/components/learner/settings/SettingsHeader";
import AccountSection from "@/components/learner/settings/AccountSection";
import LearningPreferencesSection from "@/components/learner/settings/LearningPreferencesSection";
import GeneralSettingsSection from "@/components/learner/settings/GeneralSettingsSection";

export default function SettingsPage() {
  const { user } = useAuth();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speakingEnabled, setSpeakingEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { userInfo } = useUserInfo();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-3xl mx-auto min-h-screen">
      <SettingsHeader
        title="Cài đặt"
        description="Tùy chỉnh trải nghiệm học tập của bạn."
      />

      <AccountSection
        displayName={userInfo?.full_name || "Katlinger"}
        email={user?.email || "example@katling.com"}
      />

      <LearningPreferencesSection
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        speakingEnabled={speakingEnabled}
        setSpeakingEnabled={setSpeakingEnabled}
      />

      <GeneralSettingsSection
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </div>
  );
}
