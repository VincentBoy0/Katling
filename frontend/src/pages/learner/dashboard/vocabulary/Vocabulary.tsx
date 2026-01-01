import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { vocabService } from "@/services/vocabService";
import { Library, Loader2, Plus, Search, Volume2, Trash2, Check, } from "lucide-react";


type SavedWord = {
  id: number;
  vocab_id: number;
  word: string;
  phonetic?: string | null;
  audio_url?: string | null;
  definition: Record<string, string[]>;
  review_status: "NEW" | "LEARNING" | "MASTERED";
};

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState<"dictionary" | "library">("dictionary");
  const [dictResult, setDictResult] = useState<any | null>(null);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const { data } = await vocabService.search(searchQuery);
      setDictResult(data);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Không tìm thấy từ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dictResult) return;

    await vocabService.saveWord({
      word: dictResult.word,
      definition: dictResult.definition,
      phonetic: dictResult.phonetic,
      audio_url: dictResult.audio_url,
      category: null,
    });

    toast.success("Đã lưu từ vựng");

    if (activeTab === "library") {
      const res = await vocabService.getUserWords();
      setSavedWords(res.data);
    }
  };


  const playAudio = (url?: string) => {
    if (url) {
      new Audio(url).play();
    } else {
      toast.error("Không có file âm thanh");
    }
  };

  const handleDeleteWord = async (word: string) => {
    await vocabService.deleteWord(word);
    setSavedWords((prev) =>
      prev.filter((w) => w.word !== word)
    );
  };

  const handlePromote = async (vocabId: number) => {
    const { data } = await vocabService.promote(vocabId);

    setSavedWords((prev) =>
      prev.map((w) =>
        w.vocab_id === vocabId
          ? { ...w, review_status: data.review_status }
          : w
      )
    );
  };

  useEffect(() => {
    if (activeTab === "library") {
      vocabService.getUserWords().then((res) => {
        setSavedWords(res.data);
      });
    }
  }, [activeTab]);

  return (

    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            Từ điển & Kho từ
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Tra cứu và tổ chức từ vựng theo cách của bạn.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === "dictionary" ? "outline" : "ghost"}
            onClick={() => setActiveTab("dictionary")}
            className="px-6 py-2.5 rounded-xl font-bold"
          >
            <Search className="w-4 h-4" />
            Tra từ điển
          </Button>

          <Button
            variant={activeTab === "library" ? "outline" : "ghost"}
            onClick={() => setActiveTab("library")}
            className="px-6 py-2.5 rounded-xl font-bold"
          >
            <Library className="w-4 h-4" />
            Đã lưu
          </Button>
        </div>
      </div>

      {/* TAB 1: DICTIONARY */}
      {activeTab === "dictionary" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {/* Icon search nằm trong input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />

              <Input
                placeholder="Nhập từ cần tra (VD: Resilience)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-14 h-12 text-lg font-medium rounded-2xl border-2 border-primary/20 bg-card"
              />
            </div>

            <Button
              size="lg"
              onClick={handleSearch}
              disabled={isLoading}
              className="rounded-xl font-bold h-12 px-6"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Tra cứu"}
            </Button>
          </div>

          {error && (
            <div className="text-center py-10 text-muted-foreground font-bold">
              {error}
            </div>
          )}

          {dictResult && (
            <Card className="p-6 space-y-4">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-4xl font-black">{dictResult.word}</h2>
                  <div className="flex items-center gap-2">
                    <span>{dictResult.phonetic}</span>
                    {dictResult.audio_url && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => new Audio(dictResult.audio_url).play()}
                      >
                        <Volume2 />
                      </Button>
                    )}
                  </div>
                </div>

                <Button onClick={handleSave}>
                  <Plus className="w-4 h-4" /> Lưu
                </Button>
              </div>

              {/* DEFINITIONS */}
              <div className="space-y-3">
                {(Object.entries(dictResult.definition) as [string, string[]][]).map(
                  ([partOfSpeech, defs]) => (
                    <div key={partOfSpeech}>
                      <div className="font-bold uppercase text-sm text-muted-foreground">
                        {partOfSpeech}
                      </div>
                      <ul className="list-disc pl-5">
                        {defs.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: LIBRARY (Đã Lưu) */}
      {activeTab === "library" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {savedWords.map((item) => (
            <Card key={item.id} className="p-4 space-y-3">
              <div>
                <h3 className="text-xl font-bold">
                  {item.word}
                </h3>

                {item.phonetic && (
                  <p className="text-sm text-muted-foreground">
                    {item.phonetic}
                  </p>
                )}
              </div>

              {/* definition */}
              {item.definition &&
                Object.entries(item.definition).map(
                  ([pos, defs]:[string, string[]]) => (
                    <p key={pos} className="text-sm">
                      <b>{pos}</b>: {(defs as string[])[0]}
                    </p>
                  )
                )}

              <div className="flex justify-between items-center pt-2 border-t">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteWord(item.word)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {item.review_status !== "MASTERED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePromote(item.vocab_id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Nâng cấp
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {savedWords.length === 0 && (
            <p className="text-center text-muted-foreground">
              Chưa có từ vựng nào
            </p>
          )}
        </div>
      )}
    </div>
  );
}
