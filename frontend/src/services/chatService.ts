import { api } from "@/lib/api";

export type ConversationResponse = {
  response: string;
};

export async function sendChatMessage(
  message: string
): Promise<ConversationResponse> {
  const res = await api.post("/chat/message", { message });
  return res.data;
}

export async function resetConversation() {
  await api.post("/chat/reset");
}

export async function getConversationHistory(): Promise<{
  history: { role: "user" | "assistant"; content: string }[];
}> {
  const res = await api.get("/chat/history");
  return res.data;
}
