import { Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { QuestionType } from "@/types/content";
import { QuestionFormData } from "./QuestionFormUtils";
import { useEffect } from "react";

interface QuestionEditorProps {
  formData: QuestionFormData;
  setFormData: (data: QuestionFormData) => void;
  audioUrl?: string;
  setAudioUrl?: (url: string) => void;
}

export function QuestionEditor({
  formData,
  setFormData,
  audioUrl,
  setAudioUrl,
}: QuestionEditorProps) {
  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...(formData.options || []), ""] });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, options: newOptions });
  };

  // Move option up/down for ordering
  const moveOption = (index: number, direction: "up" | "down") => {
    const newOptions = [...(formData.options || [])];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newOptions.length) return;
    [newOptions[index], newOptions[newIndex]] = [
      newOptions[newIndex],
      newOptions[index],
    ];
    setFormData({ ...formData, options: newOptions });
  };

  const updateLeftItem = (index: number, value: string) => {
    const newLeft = [...(formData.leftItems || [])];
    newLeft[index] = value;
    setFormData({ ...formData, leftItems: newLeft });
  };

  const updateRightItem = (index: number, value: string) => {
    const newRight = [...(formData.rightItems || [])];
    newRight[index] = value;
    setFormData({ ...formData, rightItems: newRight });
  };

  const addPair = () => {
    setFormData({
      ...formData,
      leftItems: [...(formData.leftItems || []), ""],
      rightItems: [...(formData.rightItems || []), ""],
    });
  };

  const removePair = (index: number) => {
    const newLeft = formData.leftItems?.filter((_, i) => i !== index) || [];
    const newRight = formData.rightItems?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, leftItems: newLeft, rightItems: newRight });
  };

  return (
    <div className="space-y-4">
      {/* TRANSCRIPT - Special layout with audio required */}
      {formData.type === QuestionType.TRANSCRIPT && (
        <TranscriptEditor
          formData={formData}
          setFormData={setFormData}
          audioUrl={audioUrl}
          setAudioUrl={setAudioUrl}
        />
      )}

      {/* Other question types */}
      {formData.type !== QuestionType.TRANSCRIPT && (
        <>
          {/* Question Text - hide for MATCHING since it doesn't need question field */}
          {formData.type !== QuestionType.MATCHING &&
            formData.type !== QuestionType.ORDERING && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {formData.type === QuestionType.PRONUNCIATION
                    ? "Văn bản"
                    : "Nội dung câu hỏi"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionText: e.target.value })
                  }
                  placeholder={getQuestionTextPlaceholder(formData.type)}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  rows={3}
                  required
                />
              </div>
            )}

          {/* Options for MCQ, Multiple Select */}
          {[QuestionType.MCQ, QuestionType.MULTIPLE_SELECT].includes(
            formData.type
          ) && (
            <OptionsEditor
              options={formData.options || []}
              updateOption={updateOption}
              addOption={addOption}
              removeOption={removeOption}
            />
          )}

          {/* Ordering with drag-drop style */}
          {formData.type === QuestionType.ORDERING && (
            <OrderingEditor
              formData={formData}
              setFormData={setFormData}
              options={formData.options || []}
              updateOption={updateOption}
              addOption={addOption}
              removeOption={removeOption}
              moveOption={moveOption}
            />
          )}

          {/* Matching Pairs */}
          {formData.type === QuestionType.MATCHING && (
            <MatchingPairsEditor
              formData={formData}
              setFormData={setFormData}
              leftItems={formData.leftItems || []}
              rightItems={formData.rightItems || []}
              updateLeftItem={updateLeftItem}
              updateRightItem={updateRightItem}
              addPair={addPair}
              removePair={removePair}
            />
          )}

          {/* Correct Answer - exclude MATCHING, ORDERING, TRANSCRIPT */}
          {![
            QuestionType.MATCHING,
            QuestionType.ORDERING,
            QuestionType.TRANSCRIPT,
          ].includes(formData.type) && (
            <CorrectAnswerEditor
              formData={formData}
              setFormData={setFormData}
            />
          )}
        </>
      )}
    </div>
  );
}

function getQuestionTextPlaceholder(type: QuestionType): string {
  switch (type) {
    case QuestionType.FILL_IN_THE_BLANK:
      return "VD: Tôi ___ đến trường vào mỗi sáng (dùng ___ để đánh dấu chỗ trống)";
    case QuestionType.PRONUNCIATION:
      return "Nhập văn bản cần phát âm...";
    case QuestionType.TRANSCRIPT:
      return "Nhập văn bản audio để chép lại...";
    default:
      return "Nhập nội dung câu hỏi...";
  }
}

interface OptionsEditorProps {
  options: string[];
  updateOption: (index: number, value: string) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
}

function OptionsEditor({
  options,
  updateOption,
  addOption,
  removeOption,
}: OptionsEditorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">
        Các lựa chọn
      </label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <span className="flex items-center justify-center w-8 h-10 bg-muted-foreground/10 rounded-lg text-sm font-semibold shrink-0">
              {index + 1}
            </span>
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Lựa chọn ${index + 1}`}
              className="flex-1 bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addOption}
        className="mt-2 text-sm text-primary hover:underline"
      >
        + Thêm lựa chọn
      </button>
    </div>
  );
}

// Ordering Editor - with move up/down buttons for user-friendly ordering
interface OrderingEditorProps {
  formData: QuestionFormData;
  setFormData: (data: QuestionFormData) => void;
  options: string[];
  updateOption: (index: number, value: string) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
  moveOption: (index: number, direction: "up" | "down") => void;
}

function OrderingEditor({
  formData,
  setFormData,
  options,
  updateOption,
  addOption,
  removeOption,
  moveOption,
}: OrderingEditorProps) {
  // Sync arrangedWords with options when options change
  useEffect(() => {
    const validOptions = options.filter((opt) => opt.trim() !== "");
    const currentArranged = formData.arrangedWords || [];

    // Build a map of current arranged words for tracking
    const arrangedMap = new Map(
      currentArranged.map((word, idx) => [word, idx])
    );

    // If there are new valid options that aren't in arrangedWords, add them
    const newArrangedWords = [...currentArranged];

    validOptions.forEach((opt) => {
      if (!arrangedMap.has(opt)) {
        // New word - add to arranged list
        newArrangedWords.push(opt);
      }
    });

    // Remove words from arranged that no longer exist in validOptions
    const validOptionsSet = new Set(validOptions);
    const filteredArranged = newArrangedWords.filter((word) =>
      validOptionsSet.has(word)
    );

    // Update if there's a difference
    if (JSON.stringify(filteredArranged) !== JSON.stringify(currentArranged)) {
      setFormData({ ...formData, arrangedWords: filteredArranged });
    }
  }, [options]);

  // Move arranged word up/down
  const moveArrangedWord = (index: number, direction: "up" | "down") => {
    const newArranged = [...(formData.arrangedWords || [])];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newArranged.length) return;
    [newArranged[index], newArranged[newIndex]] = [
      newArranged[newIndex],
      newArranged[index],
    ];
    setFormData({ ...formData, arrangedWords: newArranged });
  };

  const arrangedWords = formData.arrangedWords || [];
  const validOptions = options.filter((opt) => opt.trim() !== "");

  return (
    <div className="space-y-4">
      {/* Section 1: Input words - what learner sees */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <label className="text-sm font-semibold text-foreground">
            Các từ/mục cần sắp xếp
          </label>
        </div>

        <div className="space-y-2">
          {options.map((option, index) => (
            <div
              key={index}
              className="flex gap-2 items-center p-2 bg-muted/50 rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              <span className="flex items-center justify-center w-8 h-8 bg-blue-500/10 text-blue-600 rounded-lg text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Từ ${index + 1}`}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="mt-3 text-sm text-primary hover:underline"
        >
          + Thêm từ
        </button>
      </div>

      {/* Section 2: Correct order - arrange the words */}
      {validOptions.length > 0 && (
        <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <label className="text-sm font-semibold text-foreground">
              Sắp xếp thứ tự đúng
            </label>
          </div>

          <div className="space-y-2">
            {arrangedWords.map((word, index) => (
              <div
                key={`${word}-${index}`}
                className="flex gap-2 items-center p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-colors"
              >
                <span className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-lg text-sm font-bold shrink-0">
                  {index + 1}
                </span>

                {/* Move buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveArrangedWord(index, "up")}
                    disabled={index === 0}
                    className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Di chuyển lên"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveArrangedWord(index, "down")}
                    disabled={index === arrangedWords.length - 1}
                    className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Di chuyển xuống"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />

                <div className="flex-1 bg-background border border-green-300 rounded-lg px-3 py-2 text-foreground text-sm font-medium">
                  {word || "(trống)"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Transcript Editor - with required audio and clear sections
interface TranscriptEditorProps {
  formData: QuestionFormData;
  setFormData: (data: QuestionFormData) => void;
  audioUrl?: string;
  setAudioUrl?: (url: string) => void;
}

function TranscriptEditor({
  formData,
  setFormData,
  audioUrl,
  setAudioUrl,
}: TranscriptEditorProps) {
  const currentAudio = audioUrl ?? formData.audio_url ?? "";

  const handleAudioChange = (url: string) => {
    if (setAudioUrl) {
      setAudioUrl(url);
    } else {
      setFormData({ ...formData, audio_url: url });
    }
  };

  return (
    <div className="space-y-4">
      {/* Audio URL - Required */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          URL Audio <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          URL của file audio mà người học cần nghe và chép lại
        </p>
        <input
          type="url"
          value={currentAudio}
          onChange={(e) => handleAudioChange(e.target.value)}
          placeholder="https://example.com/audio.mp3"
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          required
        />
        {currentAudio && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Nghe thử:</p>
            <audio controls className="w-full h-10">
              <source src={currentAudio} />
              Trình duyệt không hỗ trợ audio.
            </audio>
          </div>
        )}
      </div>

      {/* Instruction/Question Text */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Hướng dẫn <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Câu hướng dẫn cho người học (VD: "Nghe audio và chép lại nội dung")
        </p>
        <textarea
          value={formData.questionText}
          onChange={(e) =>
            setFormData({ ...formData, questionText: e.target.value })
          }
          placeholder="VD: Nghe đoạn audio sau và chép lại chính xác những gì bạn nghe được"
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          rows={2}
          required
        />
      </div>

      {/* Correct Transcript */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Nội dung chính xác (Transcript){" "}
          <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Văn bản chính xác của audio. Hệ thống sẽ so sánh với câu trả lời của
          người học.
        </p>
        <textarea
          value={formData.correctAnswer}
          onChange={(e) =>
            setFormData({ ...formData, correctAnswer: e.target.value })
          }
          placeholder="Nhập nội dung chính xác của audio..."
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          rows={4}
          required
        />
      </div>
    </div>
  );
}

interface MatchingPairsEditorProps {
  formData: QuestionFormData;
  setFormData: (data: QuestionFormData) => void;
  leftItems: string[];
  rightItems: string[];
  updateLeftItem: (index: number, value: string) => void;
  updateRightItem: (index: number, value: string) => void;
  addPair: () => void;
  removePair: (index: number) => void;
}

function MatchingPairsEditor({
  formData,
  setFormData,
  leftItems,
  rightItems,
  updateLeftItem,
  updateRightItem,
  addPair,
  removePair,
}: MatchingPairsEditorProps) {
  const matchPairs = formData.matchPairs || {};

  // Toggle a match between left index and right index
  const toggleMatch = (leftIdx: number, rightIdx: number) => {
    const newPairs = { ...matchPairs };
    if (newPairs[leftIdx] === rightIdx) {
      // Remove the match
      delete newPairs[leftIdx];
    } else {
      // Add/update the match
      newPairs[leftIdx] = rightIdx;
    }
    setFormData({ ...formData, matchPairs: newPairs });
  };

  // Get valid items for matching
  const validLeftItems = leftItems
    .map((item, idx) => ({ item: item.trim(), idx }))
    .filter((x) => x.item);
  const validRightItems = rightItems
    .map((item, idx) => ({ item: item.trim(), idx }))
    .filter((x) => x.item);

  // Get matched pairs for preview
  const matchedPairs = Object.entries(matchPairs)
    .map(([leftIdx, rightIdx]) => ({
      left: leftItems[parseInt(leftIdx)]?.trim(),
      right: rightItems[rightIdx]?.trim(),
    }))
    .filter((pair) => pair.left && pair.right);

  return (
    <div className="space-y-4">
      {/* Section 1: Input left and right columns */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <label className="text-sm font-semibold text-foreground">
            Nội dung 2 cột
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-blue-600">
                Cột trái (left)
              </span>
            </div>
            <div className="space-y-2">
              {leftItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="flex items-center justify-center w-6 h-8 bg-blue-500/10 text-blue-600 rounded text-xs font-semibold shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateLeftItem(index, e.target.value)}
                    placeholder={`Mục trái ${index + 1}`}
                    className="flex-1 bg-muted border border-blue-200 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-green-600">
                Cột phải (right)
              </span>
            </div>
            <div className="space-y-2">
              {rightItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="flex items-center justify-center w-6 h-8 bg-green-500/10 text-green-600 rounded text-xs font-semibold shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateRightItem(index, e.target.value)}
                    placeholder={`Mục phải ${index + 1}`}
                    className="flex-1 bg-muted border border-green-200 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-green-500 transition-colors text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-3">
          <button
            type="button"
            onClick={addPair}
            className="text-sm text-primary hover:underline"
          >
            + Thêm mục
          </button>
          {leftItems.length > 2 && (
            <button
              type="button"
              onClick={() => removePair(leftItems.length - 1)}
              className="text-sm text-red-500 hover:underline"
            >
              - Xóa mục
            </button>
          )}
        </div>
      </div>

      {/* Section 2: Define correct matches */}
      {validLeftItems.length > 0 && validRightItems.length > 0 && (
        <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <label className="text-sm font-semibold text-foreground">
              Chỉ định các cặp đúng
            </label>
          </div>

          <div className="space-y-2">
            {validLeftItems.map(({ item: leftItem, idx: leftIdx }) => (
              <div key={leftIdx} className="flex items-center gap-3">
                <span className="shrink-0 px-3 py-2 bg-blue-500/10 text-blue-600 rounded-lg text-sm font-medium min-w-30">
                  {leftItem}
                </span>
                <span className="text-muted-foreground">→</span>
                <select
                  value={matchPairs[leftIdx] ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      const newPairs = { ...matchPairs };
                      delete newPairs[leftIdx];
                      setFormData({ ...formData, matchPairs: newPairs });
                    } else {
                      setFormData({
                        ...formData,
                        matchPairs: { ...matchPairs, [leftIdx]: parseInt(val) },
                      });
                    }
                  }}
                  className="flex-1 bg-muted border border-green-200 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-green-500 transition-colors text-sm"
                >
                  <option value="">-- Chọn mục phải --</option>
                  {validRightItems.map(({ item: rightItem, idx: rightIdx }) => (
                    <option key={rightIdx} value={rightIdx}>
                      {rightItem}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Preview matched pairs */}
          {matchedPairs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <p className="text-xs text-muted-foreground mb-2">
                Đáp án đã chọn:
              </p>
              <div className="flex flex-wrap gap-2">
                {matchedPairs.map((pair, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-black/20 rounded-lg border border-green-500/30"
                  >
                    <span className="text-sm text-blue-600 font-medium">
                      {pair.left}
                    </span>
                    <span className="text-green-500">→</span>
                    <span className="text-sm text-green-600 font-medium">
                      {pair.right}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CorrectAnswerEditorProps {
  formData: QuestionFormData;
  setFormData: (data: QuestionFormData) => void;
}

function CorrectAnswerEditor({
  formData,
  setFormData,
}: CorrectAnswerEditorProps) {
  const { type, options, correctAnswer, correctAnswers } = formData;

  const renderLabel = () => (
    <label className="block text-sm font-semibold text-foreground mb-2">
      Đáp án đúng{" "}
      {type !== QuestionType.PRONUNCIATION && (
        <span className="text-red-500">*</span>
      )}
    </label>
  );

  // TRUE_FALSE - Dropdown
  if (type === QuestionType.TRUE_FALSE) {
    return (
      <div>
        {renderLabel()}
        <select
          value={correctAnswer}
          onChange={(e) =>
            setFormData({ ...formData, correctAnswer: e.target.value })
          }
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          required
        >
          <option value="">Chọn đáp án</option>
          <option value="true">Đúng (True)</option>
          <option value="false">Sai (False)</option>
        </select>
      </div>
    );
  }

  // MCQ - Dropdown from options
  if (type === QuestionType.MCQ) {
    return (
      <div>
        {renderLabel()}
        <select
          value={correctAnswer}
          onChange={(e) =>
            setFormData({ ...formData, correctAnswer: e.target.value })
          }
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
          required
        >
          <option value="">Chọn đáp án đúng</option>
          {options
            ?.filter((opt) => opt.trim())
            .map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
        </select>
      </div>
    );
  }

  // MULTIPLE_SELECT - Checkboxes
  if (type === QuestionType.MULTIPLE_SELECT) {
    return (
      <div>
        {renderLabel()}
        <div className="space-y-2">
          {options
            ?.filter((opt) => opt.trim())
            .map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={correctAnswers?.includes(option)}
                  onChange={(e) => {
                    const newAnswers = e.target.checked
                      ? [...(correctAnswers || []), option]
                      : correctAnswers?.filter((a) => a !== option) || [];
                    setFormData({ ...formData, correctAnswers: newAnswers });
                  }}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-foreground">{option}</span>
              </label>
            ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Chọn tất cả các đáp án đúng
        </p>
      </div>
    );
  }

  // PRONUNCIATION
  if (type === QuestionType.PRONUNCIATION) {
    return (
      <div>
        {renderLabel()}
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) =>
            setFormData({ ...formData, correctAnswer: e.target.value })
          }
          placeholder="Phát âm chuẩn (để trống sẽ dùng văn bản câu hỏi)"
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Văn bản phát âm chuẩn để so sánh (tùy chọn)
        </p>
      </div>
    );
  }

  // FILL_IN_THE_BLANK or default
  return (
    <div>
      {renderLabel()}
      <input
        type="text"
        value={correctAnswer}
        onChange={(e) =>
          setFormData({ ...formData, correctAnswer: e.target.value })
        }
        placeholder={
          type === QuestionType.FILL_IN_THE_BLANK
            ? "Nhập các đáp án, cách nhau bằng dấu phẩy (VD: đi, học)"
            : "Nhập đáp án đúng"
        }
        className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
        required
      />
      {type === QuestionType.FILL_IN_THE_BLANK && (
        <p className="text-xs text-muted-foreground mt-2">
          Mỗi đáp án tương ứng với một chỗ trống (___) theo thứ tự
        </p>
      )}
    </div>
  );
}
