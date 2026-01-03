interface SettingsHeaderProps {
  title: string;
  description: string;
}

export default function SettingsHeader({
  title,
  description,
}: SettingsHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-muted-foreground font-medium text-lg">{description}</p>
    </div>
  );
}
