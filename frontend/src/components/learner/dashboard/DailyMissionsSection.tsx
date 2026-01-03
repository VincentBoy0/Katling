import DailyMissionItem from "./DailyMissionItem";
import { Mission } from "@/services/missionService";

interface DailyMissionsSectionProps {
  missions: Mission[];
  onClaim: (missionId: number) => void;
  claimingId: number | null;
  timeRemaining: string;
  loading?: boolean;
}

export default function DailyMissionsSection({
  missions,
  onClaim,
  claimingId,
  timeRemaining,
  loading = false,
}: DailyMissionsSectionProps) {
  const completedCount = missions.filter(
    (m) => m.status === "completed"
  ).length;
  const totalCount = missions.length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Nhiệm vụ hàng ngày
          </h2>
          <p className="text-sm text-gray-500">
            Hoàn thành {completedCount}/{totalCount} nhiệm vụ
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Còn lại</div>
          <div className="text-lg font-bold text-indigo-600">
            {timeRemaining}
          </div>
        </div>
      </div>

      {missions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Không có nhiệm vụ nào hôm nay</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {missions.map((mission) => (
            <DailyMissionItem
              key={mission.id}
              mission={mission}
              onClaim={onClaim}
              isClaiming={claimingId === mission.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
