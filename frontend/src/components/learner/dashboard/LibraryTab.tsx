import { Library, Folder, Filter, Sparkles, Bookmark, CheckCircle2, } from "lucide-react";

import { Button } from "../button";
import WordCard from "./WordCard";


export default function LibraryTab({ vocab }: any) {
  const {
    folders,
    filteredWords,
    selectedCategory,
    filterStatus,
    setSelectedCategory,
    setFilterStatus,
    deleteWord,
    promote,
  } = vocab;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* FOLDER FILTER */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">
          Danh mục
        </h3>

        <div className="flex flex-wrap gap-3">
          {/* Nút "Tất cả" */}
          <Button
            variant={selectedCategory=== "all" ? "folderActive" : "folder"}
            className={
              selectedCategory === "all"
                ? "bg-slate-800 text-white border-slate-950"
                : ""
            }
            onClick={() => setSelectedCategory("all")}
          >
            <Library className="w-5 h-5" /> Tất cả
          </Button>

          {/* Folder items */}
          {folders.map((folder: string) => {
            const isActive = selectedCategory === folder;

            return (
              <Button
                key={folder}
                variant={isActive ? "folderActive" : "folder"}
                className={isActive ? `border-current` : ""}
                onClick={() => {
                  setSelectedCategory(folder)
                  setFilterStatus("all");
                }}
              >
                <Folder className="w-5 h-5" /> {folder}
              </Button>
            );
          })}
        </div>
      </div>

      {/* STATUS FILTER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-2 border-border/50 pt-2">
        <Filter className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
        <Button
          variant={
            filterStatus === "all" ? "filterStatusLearning" : "filter"
          }
          size="sm"
          className="capitalize"
          onClick={() => setFilterStatus("all")}
        >
          Tất cả trạng thái
        </Button>

        <Button
          variant={
            filterStatus === "NEW" ? "filterStatusLearning" : "filter"
          }
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setFilterStatus("NEW")}
        >
          <Sparkles className="w-3 h-3" /> Từ mới
        </Button>

        <Button
          variant={
            filterStatus === "LEARNING"
              ? "filterStatusLearning"
              : "filter"
          }
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setFilterStatus("LEARNING")}
        >
          <Bookmark className="w-3 h-3" /> Đang học
        </Button>

        <Button
          variant={
            filterStatus === "MASTERED"
              ? "filterStatusMastered"
              : "filter"
          }
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setFilterStatus("MASTERED")}
        >
          <CheckCircle2 className="w-3 h-3" /> Đã thuộc
        </Button>
      </div>

      {/* WORD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWords.map((item: any) => (
          <WordCard
            key={item.id}
            word={item}
            folders={folders}
            onDelete={deleteWord}
            onPromote={promote}
          />
        ))}
        </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <Library className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="font-bold text-lg">
            Chưa có từ vựng nào trong mục này
          </p>
        </div>
      )}
    </div>
  );
}
