import type React from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/learner/button";
import {
  Mic,
  BookOpen,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Bot,
} from "lucide-react";

export default function PracticePage() {
  const navigate = useNavigate();

  const practices = [
    {
      id: "pronunciation",
      title: "Luyện phát âm",
      description:
        "Công nghệ AI phân tích giọng nói, giúp bạn sửa lỗi phát âm chi tiết từng âm tiết.",
      icon: Mic,
      // Màu hồng/đỏ (Speaking)
      theme: {
        bg: "bg-rose-50 dark:bg-rose-950/20",
        border: "border-rose-200 dark:border-rose-900",
        iconBg:
          "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
        hoverBorder: "hover:border-rose-400 dark:hover:border-rose-700",
      },
      href: "/dashboard/practice/pronunciation",
    },
    {
      id: "flashcard",
      title: "Flashcards",
      description:
        "Ôn tập từ vựng nhanh với phương pháp lặp lại ngắt quãng (Spaced Repetition).",
      icon: Layers, // Hoặc BookOpen
      // Màu tím/indigo (Memory)
      theme: {
        bg: "bg-indigo-50 dark:bg-indigo-950/20",
        border: "border-indigo-200 dark:border-indigo-900",
        iconBg:
          "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",
        hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-700",
      },
      href: "/dashboard/practice/flashcard",
    },
    {
      id: "aichat",
      title: "AI Chat",
      description:
        "Trò chuyện tự do với trợ lý ảo Katling. Luyện phản xạ hội thoại không giới hạn.",
      icon: Bot, // Hoặc MessageCircle
      // Màu xanh ngọc/emerald (Chat)
      theme: {
        bg: "bg-emerald-50 dark:bg-emerald-950/20",
        border: "border-emerald-200 dark:border-emerald-900",
        iconBg:
          "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
        hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-700",
      },
      href: "/dashboard/practice/chat",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          Luyện tập
        </h1>
        <p className="text-muted-foreground font-medium text-lg">
          Chọn kỹ năng bạn muốn cải thiện hôm nay.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practices.map((practice) => {
          const Icon = practice.icon;
          const { theme } = practice;

          return (
            <div
              key={practice.id}
              onClick={() => navigate(practice.href)}
              className={`
                group relative flex flex-col h-full
                rounded-3xl p-6 cursor-pointer
                border-2 transition-all duration-200
                hover:-translate-y-1 hover:shadow-lg
                ${theme.bg} ${theme.border} ${theme.hoverBorder}
                bg-card
              `}
            >
              {/* Icon Header */}
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-transparent group-hover:scale-105 transition-transform ${theme.iconBg}`}
                >
                  <Icon className="w-7 h-7 stroke-[2.5px]" />
                </div>

                {/* Decoration Icon mờ mờ ở góc */}
                <Icon className="absolute top-4 right-4 w-24 h-24 opacity-5 rotate-12 pointer-events-none" />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3 relative z-10">
                <h3 className="text-xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {practice.title}
                </h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  {practice.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
