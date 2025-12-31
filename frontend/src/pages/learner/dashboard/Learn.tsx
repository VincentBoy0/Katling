import type React from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Check, Lock, Play, BookOpen, Star } from "lucide-react";


// Mock Data
const units = [
  {
    id: 1,
    title: "Unit 1: Bước đầu tiên",
    description: "Làm quen với những kiến thức cơ bản nhất về tiếng Anh.",
    status: "active", // active | locked | completed
    progress: 50,
    lessons: [
      { id: 1, title: "Giới thiệu bản thân", type: "completed" },
      { id: 2, title: "Các câu chào hỏi thông dụng", type: "completed" },
      { id: 3, title: "Một ngày của tôi", type: "current" }, // Bài đang học
      { id: 4, title: "Gia đình và bạn bè", type: "locked" },
      { id: 5, title: "Ôn tập Unit 1", type: "locked", isQuiz: true },
    ],
  },
  {
    id: 2,
    title: "Unit 2: Giao tiếp hàng ngày",
    description: "Tự tin giao tiếp trong các tình huống thực tế.",
    status: "locked",
    progress: 0,
    lessons: [
      { id: 6, title: "Đi mua sắm", type: "locked" },
      { id: 7, title: "Tại nhà hàng", type: "locked" },
      { id: 8, title: "Đặt phòng khách sạn", type: "locked" },
    ],
  },
];

export default function LearnPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Lộ trình học tập
        </h1>
        <p className="text-muted-foreground font-medium">
          Hoàn thành các bài học để mở khóa chủ đề tiếp theo.
        </p>
      </div>

      <div className="space-y-8">
        {units.map((unit, index) => (
          <div key={unit.id} className="relative">
            {/* Unit Header Card */}
            <div
              className={`relative z-10 bg-card border-2 rounded-2xl overflow-hidden transition-all ${
                unit.status === "locked"
                  ? "border-border opacity-70 grayscale"
                  : "border-primary/20 shadow-sm"
              }`}
            >
              {/* Progress Bar Top */}
              {!unit.status.includes("locked") && (
                <div className="h-1.5 w-full bg-secondary/30">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${unit.progress}%` }}
                  />
                </div>
              )}

              <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex gap-4 items-center">
                  {/* Badge Number */}
                  <div
                    className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-extrabold text-xl border-2 ${
                      unit.status === "locked"
                        ? "bg-muted text-muted-foreground border-muted-foreground/20"
                        : "bg-primary text-primary-foreground border-primary-foreground/20"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {unit.title.split(":")[1] || unit.title}
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      {unit.description}
                    </p>
                  </div>
                </div>

                {unit.status === "locked" ? (
                  <div className="p-2 bg-muted rounded-lg">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                    <Star className="w-4 h-4 fill-primary" />
                    <span>{unit.progress}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson List (Timeline Style) */}
            {unit.status !== "locked" && (
              <div className="mt-6 ml-6 md:ml-8 pl-8 md:pl-10 border-l-2 border-border space-y-6 pb-4">
                {unit.lessons.map((lesson) => {
                  const isCompleted = lesson.type === "completed";
                  const isCurrent = lesson.type === "current";
                  const isLocked = lesson.type === "locked";
                  const isQuiz = lesson.isQuiz;

                  return (
                    <div key={lesson.id} className="relative group">
                      {/* Connector Line (Horizontal) */}
                      <div
                        className={`absolute -left-[42px] md:-left-[50px] top-1/2 -translate-y-1/2 w-6 h-0.5 ${
                          isLocked ? "bg-border" : "bg-primary/30"
                        }`}
                      />

                      {/* Timeline Dot Icons */}
                      <div
                        className={`absolute -left-[54px] md:-left-[62px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-transform ${
                          isCompleted
                            ? "bg-green-500 border-green-600 text-white"
                            : isCurrent
                            ? "bg-primary border-primary text-white scale-110 shadow-[0_0_0_4px_rgba(var(--primary),0.2)]"
                            : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {isCompleted && (
                          <Check className="w-4 h-4" strokeWidth={3} />
                        )}
                        {isCurrent && (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                        {isLocked && <Lock className="w-3.5 h-3.5" />}
                      </div>

                      {/* Lesson Card */}
                      <div
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:-translate-y-0.5 ${
                          isCurrent
                            ? "bg-card border-primary/30 shadow-md ring-1 ring-primary/20"
                            : isCompleted
                            ? "bg-card border-green-200 dark:border-green-900/50 opacity-80 hover:opacity-100"
                            : "bg-muted/30 border-transparent hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2.5 rounded-lg ${
                              isQuiz
                                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                                : isCurrent
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isQuiz ? (
                              <Star className="w-5 h-5" />
                            ) : (
                              <BookOpen className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h3
                              className={`font-bold text-base ${
                                isLocked
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {lesson.title}
                            </h3>
                            {isCurrent && (
                              <span className="text-xs font-bold text-primary animate-pulse">
                                Đang học dở...
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons - ĐÃ SỬA ĐƯỜNG DẪN */}
                        <div className="shrink-0">
                          {isCurrent ? (
                            <Button
                              onClick={() =>
                                navigate(`/dashboard/lesson/${lesson.id}`)
                              }
                              className="font-bold shadow-sm"
                            >
                              Bắt đầu
                            </Button>
                          ) : isCompleted ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-green-600 font-bold"
                              onClick={() =>
                                navigate(`/dashboard/lesson/${lesson.id}`)
                              }
                            >
                              Ôn tập
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" disabled>
                              <Lock className="w-4 h-4 text-muted-foreground/50" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Coming Soon Section */}
        <div className="text-center py-10 opacity-50">
          <div className="inline-block p-4 bg-muted rounded-full mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <p className="font-bold text-muted-foreground">
            Đạt level 3 để mở khóa bài học tiếp theo!
          </p>
        </div>
      </div>
    </div>
  );
}
