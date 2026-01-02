import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Play } from "lucide-react";

interface ContinueLearningCardProps {
  unit: string;
  lesson: string;
  title: string;
  description: string;
  onContinue: () => void;
}

export default function ContinueLearningCard({
  unit,
  lesson,
  title,
  description,
  onContinue,
}: ContinueLearningCardProps) {
  return (
    <Card className="relative overflow-hidden border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/10 p-6 md:p-8 rounded-3xl">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-200/50 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            {unit} • {lesson}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-indigo-900 dark:text-indigo-100">
            {title}
          </h2>
          <p className="text-indigo-700 dark:text-indigo-300 font-medium">
            {description}
          </p>
        </div>

        <Button
          onClick={onContinue}
          className="h-14 text-lg font-bold hover:bg-primary/90 shadow-md hover:translate-y-[-2px] active:translate-y-0 transition-all shrink-0 w-full md:w-auto"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          Học tiếp
        </Button>
      </div>

      {/* Decor */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
    </Card>
  );
}
