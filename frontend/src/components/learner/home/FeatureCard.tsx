import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  titleColor: string;
  reverse?: boolean;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor,
  bgColor,
  borderColor,
  titleColor,
  reverse = false,
}: FeatureCardProps) {
  return (
    <section className="py-20 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
        {/* Icon */}
        <div
          className={`flex justify-center ${
            reverse ? "order-1 md:order-2" : "order-1"
          }`}
        >
          <div
            className={`w-64 h-64 ${bgColor} rounded-3xl flex items-center justify-center ${
              reverse ? "-rotate-3" : "rotate-3"
            } border-4 ${borderColor} shadow-sm`}
          >
            <Icon className={`w-32 h-32 ${iconColor}`} />
          </div>
        </div>

        {/* Text */}
        <div
          className={`text-center md:text-left ${
            reverse ? "order-2 md:order-1" : "order-2"
          } space-y-4`}
        >
          <h3 className={`text-3xl font-extrabold ${titleColor}`}>{title}</h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
