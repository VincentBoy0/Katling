import { useRef } from "react";

export interface RecordingResult {
  /** WAV blob at 16kHz for server processing (Wav2Vec) */
  wavBlob: Blob;
  /** Original WebM blob for playback (better compatibility with speakers) */
  webmBlob: Blob;
}

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      console.log("🎤 Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      console.log("✅ Microphone access granted");

      // Try to use audio/webm;codecs=opus, fallback to default
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      console.log("📼 Using mimeType:", mimeType);

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log("🔊 Audio chunk received:", e.data.size, "bytes");
        }
      };

      recorder.onerror = (e) => {
        console.error("❌ MediaRecorder error:", e);
      };

      // Collect data every 100ms for better reliability
      recorder.start(100);
      console.log("🔴 Recording started");
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error("❌ Failed to start recording:", err);
      throw err;
    }
  };

  async function webmToWav(blob: Blob): Promise<Blob> {
    const audioCtx = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();

    // Check if we have actual audio data
    if (arrayBuffer.byteLength === 0) {
      throw new Error("No audio data recorded");
    }

    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Resample to 16kHz for Wav2Vec compatibility
    const targetSampleRate = 16000;
    const offlineCtx = new OfflineAudioContext(
      1,
      Math.ceil(audioBuffer.duration * targetSampleRate),
      targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const resampledBuffer = await offlineCtx.startRendering();
    const channelData = resampledBuffer.getChannelData(0);

    const wavBuffer = encodeWav(channelData, targetSampleRate);

    return new Blob([wavBuffer], { type: "audio/wav" });
  }

  const stop = (): Promise<RecordingResult> =>
    new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        reject(new Error("No recorder available"));
        return;
      }

      recorder.onstop = async () => {
        try {
          if (chunksRef.current.length === 0) {
            reject(new Error("No audio chunks recorded"));
            return;
          }

          const webmBlob = new Blob(chunksRef.current, {
            type: recorder.mimeType,
          });
          console.log("Recorded audio size:", webmBlob.size, "bytes");

          if (webmBlob.size < 100) {
            reject(new Error("Audio too short or empty"));
            return;
          }

          const wavBlob = await webmToWav(webmBlob);
          console.log("WAV audio size:", wavBlob.size, "bytes");

          // Return both formats
          resolve({ wavBlob, webmBlob });
        } catch (err) {
          console.error("Error converting audio:", err);
          reject(err);
        }
      };

      recorder.stream.getTracks().forEach((track) => track.stop());
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
  writeString(offset, "RIFF");
  offset += 4;
  view.setUint32(offset, 36 + samples.length * 2, true);
  offset += 4;
  writeString(offset, "WAVE");
  offset += 4;

  // fmt subchunk
  writeString(offset, "fmt ");
  offset += 4;
  view.setUint32(offset, 16, true);
  offset += 4; // PCM
  view.setUint16(offset, 1, true);
  offset += 2; // Linear PCM
  view.setUint16(offset, 1, true);
  offset += 2; // Mono
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * 2, true);
  offset += 4;
  view.setUint16(offset, 2, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;

  // data subchunk
  writeString(offset, "data");
  offset += 4;
  view.setUint32(offset, samples.length * 2, true);
  offset += 4;

  // PCM samples
  let pos = offset;
  for (let i = 0; i < samples.length; i++, pos += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}
