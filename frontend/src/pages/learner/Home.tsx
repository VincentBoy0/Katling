import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { BookOpen, Star, Users, Zap } from "lucide-react";

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

      {/*
        MAIN CONTENT
        - pt-16: Thêm padding-top 4rem (64px) bằng chiều cao của header
          để nội dung không bị header che mất.
      */}
      <main className="flex-1 pt-16">
        {/* HERO SECTION */}
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
                Katling kết hợp trí tuệ nhân tạo, trò chơi hóa và cộng đồng để
                giúp bạn nắm vững tiếng Anh mỗi ngày.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="font-bold text-md shadow-md"
                >
                  Tạo tài khoản miễn phí
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-bold text-md"
                >
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* --- CÁC TÍNH NĂNG (LAYOUT ZIG-ZAG) --- */}

        {/* Feature 1: Bài học thực tế */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center order-1">
              <div className="w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center rotate-3 border-4 border-blue-100 dark:border-blue-800 shadow-sm">
                <BookOpen className="w-32 h-32 text-blue-500" />
              </div>
            </div>
            <div className="text-center md:text-left order-2 space-y-4">
              <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                Bài học thực tế
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Giáo trình được thiết kế từ cơ bản đến nâng cao. Bạn sẽ học từ
                vựng và ngữ pháp thông qua các ngữ cảnh đời sống, giúp nhớ lâu
                và áp dụng ngay lập tức.
              </p>
            </div>
          </div>
        </section>

        {/* Feature 2: Trò chơi hóa */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
            <div className="text-center md:text-left order-2 md:order-1 space-y-4">
              <h3 className="text-3xl font-extrabold text-primary">
                Vừa chơi vừa học
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Không còn nhàm chán! Kiếm điểm kinh nghiệm, đua top bảng xếp
                hạng và sưu tập các huy hiệu độc đáo. Mỗi bài học là một trò
                chơi thú vị.
              </p>
            </div>
            <div className="flex justify-center order-1 md:order-2">
              <div className="w-64 h-64 bg-primary/10 rounded-3xl flex items-center justify-center -rotate-3 border-4 border-primary/20 shadow-sm">
                <Zap className="w-32 h-32 text-primary fill-primary/10" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Cộng đồng & AI */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center order-1">
              <div className="w-64 h-64 bg-accent/20 rounded-3xl flex items-center justify-center rotate-3 border-4 border-accent shadow-sm">
                <Users className="w-32 h-32 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-center md:text-left order-2 space-y-4">
              <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                Cộng đồng & AI
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Kết bạn và thi đấu cùng hàng ngàn người học khác. Trợ lý AI
                thông minh sẽ giúp bạn sửa lỗi phát âm và luyện hội thoại 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="bg-primary py-16 px-4">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center text-primary-foreground">
            <div className="space-y-2">
              <div className="text-5xl font-extrabold">100K+</div>
              <p className="text-primary-foreground/90 font-medium">
                Người học đang sử dụng
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-extrabold">50+</div>
              <p className="text-primary-foreground/90 font-medium">
                Chủ đề học tập
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-extrabold">24/7</div>
              <p className="text-primary-foreground/90 font-medium">
                Hỗ trợ học tập
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-6 tracking-tight">
              Sẵn sàng bắt đầu chưa?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Tham gia cộng đồng học tập Katling và bắt đầu hành trình chinh
              phục tiếng Anh của bạn ngay hôm nay.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="font-bold text-md shadow-md"
            >
              Tạo tài khoản ngay
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary/30 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm font-medium">
          <p>© 2025 Katling. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
