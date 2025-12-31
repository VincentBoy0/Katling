import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/learner/button";
import {
  Check,
  Target,
  BrainCircuit,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Định nghĩa các bước
const STEPS = [
  {
    id: "goal",
    title: "Mục tiêu học tập của bạn?",
    icon: Target,
    options: [
      {
        id: "casual",
        label: "Vui là chính",
        desc: "5 phút / ngày",
        icon: "☕",
      },
      { id: "regular", label: "Vừa phải", desc: "15 phút / ngày", icon: "📖" },
      {
        id: "serious",
        label: "Nghiêm túc",
        desc: "30 phút / ngày",
        icon: "🔥",
      },
      { id: "insane", label: "Cực độ", desc: "60 phút / ngày", icon: "⚡" },
    ],
  },
  {
    id: "level",
    title: "Trình độ hiện tại?",
    icon: BrainCircuit,
    options: [
      { id: "new", label: "Mới bắt đầu", desc: "Chưa biết gì cả", icon: "🐣" },
      {
        id: "basic",
        label: "Biết sơ sơ",
        desc: "Biết chào hỏi cơ bản",
        icon: "💬",
      },
      {
        id: "intermediate",
        label: "Khá tốt",
        desc: "Giao tiếp được chút ít",
        icon: "🗣️",
      },
    ],
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const stepData = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleSelect = (optionId: string) => {
    setSelections({ ...selections, [stepData.id]: optionId });
  };

  const handleNext = () => {
    if (isLastStep) {
      navigate("/dashboard");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 max-w-2xl mx-auto">
      {/* Header Progress */}
      <div className="w-full flex items-center gap-4 mb-8 pt-4">
        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex-1 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500 key={currentStep}">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <stepData.icon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2">
            {stepData.title}
          </h1>
          <p className="text-muted-foreground font-medium">
            Giúp Katling cá nhân hóa lộ trình cho bạn.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-4 w-full mb-8">
          {stepData.options.map((option) => {
            const isSelected = selections[stepData.id] === option.id;

            return (
              <div
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`
                  relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-[0_0_0_2px_rgba(var(--primary),0.2)]"
                      : "border-border bg-card hover:bg-muted/30 hover:border-primary/50"
                  }
                 active:translate-y-1 active:border-b-2
                `}
              >
                <div className="text-4xl">{option.icon}</div>
                <div className="flex-1">
                  <h3
                    className={`font-bold text-lg ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {option.desc}
                  </p>
                </div>

                {/* Custom Radio Circle */}
                <div
                  className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  }
                `}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3px]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Button */}
        <div className="w-full mt-auto pb-6">
          <Button
            onClick={handleNext}
            disabled={!selections[stepData.id]}
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg border-primary-foreground/20 active:border-b-0 active:translate-y-1 transition-all rounded-2xl"
          >
            {isLastStep ? (
              <span className="flex items-center gap-2">
                Bắt đầu hành trình <Sparkles className="w-5 h-5" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Tiếp tục <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
