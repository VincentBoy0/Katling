import { useNavigate } from "react-router-dom";
import { Button } from "@/components/learner/button";
import { Star } from "lucide-react";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Cột Trái: Mascot & Stars Animation */}
        <div className="order-2 md:order-1 flex justify-center relative">
          <Star className="absolute top-0 right-10 text-accent w-10 h-10 animate-pulse fill-accent/20" />
          <Star className="absolute bottom-10 left-10 text-primary w-8 h-8 animate-bounce fill-primary/20" />
          <Star className="absolute top-1/2 left-0 text-secondary-foreground w-6 h-6 animate-pulse delay-700" />

          <div className="relative w-80 h-80 lg:w-96 lg:h-96">
            <img
              src="/img/logo_with_name_under.png"
              alt="Katling Mascot"
              className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Cột Phải: Text */}
        <div className="order-1 md:order-2 text-center md:text-left">
          <h2 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
            Học tiếng Anh
            <br />
            <span className="text-primary">một cách vui nhộn</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
            Katling kết hợp trí tuệ nhân tạo, trò chơi hóa và cộng đồng để giúp
            bạn nắm vững tiếng Anh mỗi ngày.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="font-bold text-md shadow-md"
            >
              Tạo tài khoản miễn phí
            </Button>
            <Button size="lg" variant="outline" className="font-bold text-md">
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
