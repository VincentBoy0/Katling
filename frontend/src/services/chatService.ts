import { api } from "@/lib/api";

export type ConversationResponse = {
  response: string;
};

export type VoiceChatResponse = {
  user_text: string;
  response_text: string;
  has_audio: boolean;
  audio_lang?: string;
};

export async function sendChatMessage(
  message: string
): Promise<ConversationResponse> {
  const res = await api.post("/chat/message", { message });
  return res.data;
}

export async function sendVoiceMessage(
  audioBlob: Blob,
  forceEnglish: boolean = false
): Promise<VoiceChatResponse> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "voice.wav");
  formData.append("force_english", forceEnglish.toString());

  const res = await api.post("/chat/voice", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function getTextToSpeech(
  text: string,
  lang: string = "en"
): Promise<Blob> {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("lang", lang);

  const res = await api.post("/chat/voice/tts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });
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
