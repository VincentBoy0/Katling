import { Trash2, Check, } from "lucide-react";

import { Button } from "../button";
import type { SavedWord } from "@/hooks/useVocab";

type Props = {
  word: SavedWord;
  folders: string[];
  onDelete: (word: string) => void;
  onPromote: (vocabId: number) => void;
};

export default function WordCard({
  word,
  folders,
  onDelete,
  onPromote,
}: Props) {
  return (
    <div className="group relative bg-card border-2 border-border rounded-2xl p-6 hover:-translate-y-1 transition-all hover:shadow-md flex flex-col">
      {/* BADGES */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* Folder badge */}
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-background text-muted-foreground uppercase">
          {word.category ?? "Uncategorized"}
        </span>

        {/* Status badge */}
        {word.review_status === "NEWBIE" && (
          <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
            Mới
          </span>
        )}
        {word.review_status === "LEARNING" && (
          <span className="bg-yellow-100 text-yellow-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
            Đang học
          </span>
        )}
        {word.review_status === "MASTERED" && (
          <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
            Thuộc
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="mb-4">
        <h3 className="text-2xl font-black text-foreground">
          {word.word}
        </h3>

        {word.phonetic && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono text-muted-foreground">
              {word.phonetic}
            </span>
          </div>
        )}

        {Object.entries(word.definition).map(([pos, defs]) => (
          <p key={pos} className="text-sm">
            <b>{pos}</b>: {defs[0]}
          </p>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between items-center pt-2 border-t">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(word.word)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {word.review_status !== "MASTERED" && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-bold border-green-200 hover:bg-green-50 hover:text-green-600"
            onClick={() => onPromote(word.vocab_id)}
          >
            <Check className="w-4 h-4 mr-1" />
            Nâng cấp
          </Button>
        )}
      </div>
    </div>
  );
}
