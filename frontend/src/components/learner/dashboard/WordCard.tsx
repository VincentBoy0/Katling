import { Trash2, Check, } from "lucide-react";

import { Button } from "../button";
import type { UserWordWithVocabOut } from "@/types/vocab";

type Props = {
  word: UserWordWithVocabOut;
  folders: string[];
  onDelete: (userWordId: number) => void;
  onPromote: (userWordId: number) => void;
};

export default function WordCard({
  word,
  onDelete,
  onPromote,
}: Props) {
  return (
    <div className="group relative bg-card border-2 border-border rounded-2xl p-5 hover:-translate-y-1 transition-all hover:shadow-md flex flex-col h-full min-h-[200px]">
      {/* STATUS BADGE - Top Right */}
      <div className="absolute top-3 right-3">
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

      {/* CONTENT - Flex grow to push actions to bottom */}
      <div className="flex-1 pr-16">
        <h3 className="text-xl font-black text-foreground break-words">
          {word.word}
        </h3>

        {word.phonetic && (
          <span className="text-xs font-mono text-muted-foreground">
            {word.phonetic}
          </span>
        )}

        {word.definition && Object.entries(word.definition).map(([pos, defs]) => (
          <p key={pos} className="text-sm mt-1">
            <b>{pos}</b>: {defs[0]}
          </p>
        ))}
      </div>

      {/* CATEGORY BADGE - Above actions */}
      <div className="mt-3 mb-2">
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-background text-muted-foreground uppercase truncate inline-block max-w-full">
          {word.category ?? "Uncategorized"}
        </span>
      </div>

      {/* ACTIONS - Always at bottom */}
      <div className="flex justify-between items-center pt-2 border-t mt-auto">
        <Button
          size="sm"
          variant="ghost"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => onDelete(word.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {word.review_status !== "MASTERED" ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-bold border-green-200 hover:bg-green-50 hover:text-green-600"
            onClick={() => onPromote(word.id)}
          >
            <Check className="w-4 h-4 mr-1" />
            Nâng cấp
          </Button>
        ) : (
          <span className="text-xs text-green-600 font-bold">✓ Đã thuộc</span>
        )}
      </div>
    </div>
  );
}
