import { api } from '@/lib/api'

export async function assessPronunciation(
  audio: Blob,
  referenceText: string
) {
  const formData = new FormData();
  formData.append("reference_text", referenceText);
  formData.append("audio", audio, "speech.webm");

  const res = await api.post(
    "/chatbot/assess",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
}

export async function generateWord(level = "beginner") {
  const res = await api.post("/chatbot/generate-word", {
    level,
    topic: "daily",
  });
  return res.data;
}

export async function generateWordBatch(count = 5, level = "beginner") {
  const res = await api.post("/chatbot/generate-word-batch", {
    count,
    level,
    topic: "daily",
  });
  return res.data;
}
