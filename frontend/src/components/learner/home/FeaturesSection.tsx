import { BookOpen, Zap, Users } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  return (
    <>
      {/* Feature 1: Bài học thực tế */}
      <FeatureCard
        icon={BookOpen}
        title="Bài học thực tế"
        description="Giáo trình được thiết kế từ cơ bản đến nâng cao. Bạn sẽ học từ vựng và ngữ pháp thông qua các ngữ cảnh đời sống, giúp nhớ lâu và áp dụng ngay lập tức."
        iconColor="text-blue-500"
        bgColor="bg-blue-50 dark:bg-blue-900/20"
        borderColor="border-blue-100 dark:border-blue-800"
        titleColor="text-blue-600 dark:text-blue-400"
      />

      {/* Feature 2: Trò chơi hóa */}
      <FeatureCard
        icon={Zap}
        title="Vừa chơi vừa học"
        description="Không còn nhàm chán! Kiếm điểm kinh nghiệm, đua top bảng xếp hạng và sưu tập các huy hiệu độc đáo. Mỗi bài học là một trò chơi thú vị."
        iconColor="text-primary fill-primary/10"
        bgColor="bg-primary/10"
        borderColor="border-primary/20"
        titleColor="text-primary"
        reverse
      />

      {/* Feature 3: Cộng đồng & AI */}
      <FeatureCard
        icon={Users}
        title="Cộng đồng & AI"
        description="Kết bạn và thi đấu cùng hàng ngàn người học khác. Trợ lý AI thông minh sẽ giúp bạn sửa lỗi phát âm và luyện hội thoại 24/7."
        iconColor="text-emerald-600 dark:text-emerald-400"
        bgColor="bg-accent/20"
        borderColor="border-accent"
        titleColor="text-emerald-600 dark:text-emerald-400"
      />
    </>
  );
}
