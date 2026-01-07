import { useState } from "react";
import { Folder, Loader2, Plus, Search, Volume2 } from "lucide-react";

import { Input } from "../input";
import { Button } from "../button";
import { Card } from "../card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../dialog";
import { toast } from "sonner";

export default function DictionaryTab({ vocab }: { vocab: any }) {
  const {
    searchQuery,
    setSearchQuery,
    search,
    dictResult,
    isLoading,
    error,
    saveWord,
    folders,
    setSelectedCategory,
  } = vocab;

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Input search */}
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input
            placeholder="Nhập từ cần tra (VD: Resilience)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="pl-14 h-12 text-lg font-medium rounded-2xl border-2 border-primary/20 bg-card"
          />
        </div>

        <Button
          size="lg"
          onClick={search}
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

      {/* Result Card */}
      {dictResult && !error && (
        <Card className="max-w-2xl mx-auto p-6 md:p-8 border-2 border-indigo-200 dark:border-indigo-900 bg-card rounded-3xl shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-2">{dictResult.word}</h2>
              <div className="flex items-center gap-3">
                <span className="text-xl font-mono text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{dictResult.phonetic}</span>
                {dictResult.audio_url && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-indigo-100 text-indigo-600"
                    onClick={() => new Audio(dictResult.audio_url).play()}
                  >
                    <Volume2 className="w-6 h-6" />
                  </Button>
                )}
              </div>
            </div>

            {/* Save dialog */}
            <Dialog
              open={isSaveDialogOpen}
              onOpenChange={(open) => {
                setIsSaveDialogOpen(open);
                if (!open) setNewFolderName("");
              }}
            >
              <DialogTrigger asChild>
                <Button disabled={!dictResult} className="gap-2 font-bold bg-emerald-500 hover:bg-emerald-600 border-emerald-700 active:border-b-0 active:translate-y-1">
                  <Plus className="w-4 h-4" /> Lưu từ
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-2 border-border rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    Lưu vào đâu?
                  </DialogTitle>
                  <DialogDescription>
                    Chọn folder hoặc tạo mới để lưu từ vựng này.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-1">
                    {folders.map((folder: string) => (
                      <div
                        key={folder}
                        onClick={() => {
                          setSelectedCategory(folder)
                          saveWord(folder);
                          setIsSaveDialogOpen(false);
                        }}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-2`}
                      >
                        <Folder className="w-5 h-5 fill-current opacity-50" />
                        <span className="font-bold truncate">
                          {folder}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Input
                      placeholder="Tên folder mới..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="h-10"
                    />
                    <Button
                      onClick={() => {
                        if (!newFolderName.trim()) return;
                        const folder = newFolderName.trim();

                        if (folders.includes(folder)) {
                          toast.error("Folder đã tồn tại");
                          return;
                        }
                        setSelectedCategory(folder);
                        saveWord(folder);
                        setNewFolderName("");
                        setIsSaveDialogOpen(false);
                      }}
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 shrink-0 border-2"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
  );
}
