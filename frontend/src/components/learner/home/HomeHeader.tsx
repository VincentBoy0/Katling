import { useNavigate } from "react-router-dom";
import { Button } from "@/components/learner/button";

export default function HomeHeader() {
  const navigate = useNavigate();

  return (
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
  );
}
