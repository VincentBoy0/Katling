export default function StatsSection() {
  const stats = [
    { value: "100K+", label: "Người học đang sử dụng" },
    { value: "50+", label: "Chủ đề học tập" },
    { value: "24/7", label: "Hỗ trợ học tập" },
  ];

  return (
    <section className="bg-primary py-16 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center text-primary-foreground">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="text-5xl font-extrabold">{stat.value}</div>
            <p className="text-primary-foreground/90 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
