import { useRef } from "react";

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  async function webmToWav(blob: Blob): Promise<Blob> {
    const audioCtx = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0);
    const wavBuffer = encodeWav(channelData, audioBuffer.sampleRate);

    return new Blob([wavBuffer], { type: "audio/wav" });
  }

  const stop = (): Promise<Blob> =>
    new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return;

      recorder.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const wavBlob = await webmToWav(webmBlob);
        resolve(wavBlob);
      };
      recorder.stream.getTracks().forEach(track => track.stop());

      recorder.stop();
    });

  return { start, stop };
}


function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  let offset = 0;

  // RIFF header
  writeString(offset, "RIFF"); offset += 4;
  view.setUint32(offset, 36 + samples.length * 2, true); offset += 4;
  writeString(offset, "WAVE"); offset += 4;

  // fmt subchunk
  writeString(offset, "fmt "); offset += 4;
  view.setUint32(offset, 16, true); offset += 4; // PCM
  view.setUint16(offset, 1, true); offset += 2;  // Linear PCM
  view.setUint16(offset, 1, true); offset += 2;  // Mono
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * 2, true); offset += 4;
  view.setUint16(offset, 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;

  // data subchunk
  writeString(offset, "data"); offset += 4;
  view.setUint32(offset, samples.length * 2, true); offset += 4;

  // PCM samples
  let pos = offset;
  for (let i = 0; i < samples.length; i++, pos += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}
