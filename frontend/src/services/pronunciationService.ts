import { api } from "@/lib/api";
import {
  GenerateMaterialResponse,
  AssessPronunciationResponse,
} from "@/types/pronunciation";

export async function generateMaterial(params: {
  mode: "word" | "sentence";
  count: number;
  level?: string;
  topic?: string;
}): Promise<GenerateMaterialResponse> {
  const res = await api.post("/pronunciation/material", params);
  return res.data;
}

export async function assessPronunciation(
  audio: Blob,
  reference: string
): Promise<AssessPronunciationResponse> {
  const formData = new FormData();
  formData.append("reference", reference);
  formData.append("audio", audio);

  const res = await api.post("/pronunciation/assess", formData);
  return res.data;
}
