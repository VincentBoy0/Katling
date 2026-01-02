import { Card } from "@/components/ui/card";
import { Mic, Volume2 } from "lucide-react";
import SettingItem from "./SettingItem";

interface LearningPreferencesSectionProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  speakingEnabled: boolean;
  setSpeakingEnabled: (enabled: boolean) => void;
}

export default function LearningPreferencesSection({
  soundEnabled,
  setSoundEnabled,
  speakingEnabled,
  setSpeakingEnabled,
}: LearningPreferencesSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground ml-1">
        Trải nghiệm học tập
      </h2>
      <Card className="border-2 border-border rounded-2xl overflow-hidden bg-card">
        <SettingItem
          icon={Volume2}
          iconColorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
          title="Hiệu ứng âm thanh"
          description="Âm thanh khi đúng/sai"
          checked={soundEnabled}
          onCheckedChange={setSoundEnabled}
          hasBorder={true}
        />

        <SettingItem
          icon={Mic}
          iconColorClass="bg-rose-100 dark:bg-rose-900/30 text-rose-600"
          title="Microphone"
          description="Cho phép microphone cho luyện nói"
          checked={speakingEnabled}
          onCheckedChange={setSpeakingEnabled}
        />
      </Card>
    </section>
  );
}
