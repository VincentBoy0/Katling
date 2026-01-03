export const getAvatarColor = (name: string) => {
  const colors = [
    "bg-purple-100 text-purple-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-pink-100 text-pink-600",
    "bg-yellow-100 text-yellow-700",
    "bg-indigo-100 text-indigo-600",
    "bg-red-100 text-red-600",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};
