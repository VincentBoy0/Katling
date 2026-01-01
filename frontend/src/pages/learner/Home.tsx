import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      <HomeHeader />

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
