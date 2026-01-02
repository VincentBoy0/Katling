interface WelcomeHeaderProps {
  userName: string;
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return "Chào buổi sáng";
  if (hour >= 11 && hour < 14) return "Chào buổi trưa";
  if (hour >= 14 && hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        {getTimeGreeting()}, {userName}!
      </h1>
      <p className="text-muted-foreground font-medium">
        Bạn đã sẵn sàng chinh phục bài học tiếp theo chưa?
      </p>
    </div>
  );
}
