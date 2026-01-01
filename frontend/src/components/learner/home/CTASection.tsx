import { useNavigate } from "react-router-dom";
import { Button } from "@/components/learner/button";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-6 tracking-tight">
          Sẵn sàng bắt đầu chưa?
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Tham gia cộng đồng học tập Katling và bắt đầu hành trình chinh phục
          tiếng Anh của bạn ngay hôm nay.
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
  );
}
