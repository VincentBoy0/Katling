import { Library, Search, } from "lucide-react";

import { Button } from "@/components/ui/button";
import DictionaryTab from "@/components/learner/dashboard/DictionaryTab";
import LibraryTab from "@/components/learner/dashboard/LibraryTab";
import { useVocab } from "@/hooks/useVocab";


export default function VocabularyPage() {
  const vocab = useVocab();

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
            variant={vocab.activeTab === "dictionary" ? "outline" : "ghost"}
            onClick={() => vocab.setActiveTab("dictionary")}
            className="px-6 py-2.5 rounded-xl font-bold"
          >
            <Search className="w-4 h-4" />
            Tra từ điển
          </Button>

          <Button
            variant={vocab.activeTab === "library" ? "outline" : "ghost"}
            onClick={() => vocab.setActiveTab("library")}
            className="px-6 py-2.5 rounded-xl font-bold"
          >
            <Library className="w-4 h-4" />
            Đã lưu
          </Button>
        </div>
      </div>

      {vocab.activeTab === "dictionary" && (
        <DictionaryTab vocab={vocab} />
      )}

      {vocab.activeTab === "library" && (
        <LibraryTab vocab={vocab} />
      )}
    </div>
  );
}
