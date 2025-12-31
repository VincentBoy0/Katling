import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

<<<<<<< HEAD
=======
import { Button } from "@/components/ui/button";
>>>>>>> 60086b330a23903b02e4f443eb48dda94d66970a
import { useAuth } from "@/context/auth-context";
import HomeHeader from "@/components/learner/home/HomeHeader";
import HeroSection from "@/components/learner/home/HeroSection";
import FeaturesSection from "@/components/learner/home/FeaturesSection";
import StatsSection from "@/components/learner/home/StatsSection";
import CTASection from "@/components/learner/home/CTASection";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
<<<<<<< HEAD
      <HomeHeader />
=======
      {/*
        HEADER CỐ ĐỊNH (FIXED)
        - fixed: Cố định vị trí so với cửa sổ trình duyệt
        - top-0 left-0 right-0: Căn sát lề trên và trải rộng toàn màn hình
        - z-50: Đảm bảo luôn nằm trên các thành phần khác
      */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border h-16 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/img/logo_with_name.png"
              alt="Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              className="font-bold shadow-sm"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </header>
>>>>>>> 60086b330a23903b02e4f443eb48dda94d66970a

      <main className="flex-1 pt-16">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <CTASection />
      </main>

      <footer className="bg-secondary/30 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm font-medium">
          <p>© 2025 Katling. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
