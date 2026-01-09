export type PracticeItem =
  | {
      type: "word";
      text: string;
    }
  | {
      type: "sentence";
      text: string;
    };

export type GenerateMaterialResponse = {
  items: PracticeItem[];
};

export type PronunciationError = {
  word: string;
  severity: "minor" | "moderate" | "severe";
};

export type AssessPronunciationResponse = {
  assessment: {
    score: number; // 0–10
    errors: PronunciationError[];
  };
  feedback: string;
};
