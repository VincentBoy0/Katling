// services/chat.ts
import { api } from "@/lib/api";

export async function chatWithBot(message: string) {
  const res = await api.post("/chatbot/chat", {
    message,
    sentence_type: "auto",
  });
  return res.data;
}
