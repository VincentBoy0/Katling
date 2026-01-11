import { AlertCircle, CheckCircle, Loader2, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Checkbox } from "@/components/learner/checkbox";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  QuestionAnswerSubmitResponse,
  QuestionInfo,
} from "@/types/lesson";

interface BaseQuestionProps {
  question: QuestionInfo;
  onAnswerSubmit: (answer: Record<string, any>) => Promise<void>;
  currentAnswer?: Record<string, any>;
  answerResult?: QuestionAnswerSubmitResponse;
  submitting: boolean;
}

export function MultipleChoiceQuestion({
  question,
  onAnswerSubmit,
  currentAnswer,
  answerResult,
  submitting,
}: BaseQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    currentAnswer?.answer || null
  );

  useEffect(() => {
    setSelectedAnswer(currentAnswer?.answer || null);
  }, [currentAnswer]);

  const handleSubmit = async () => {
    if (selectedAnswer) {
      await onAnswerSubmit({ answer: selectedAnswer });
    }
  };

  const options = Array.isArray(question.content?.options)
    ? question.content.options
    : [];

  return (
    <div className="space-y-6">
      <QuestionHeader question={question} />

      <div className="space-y-3">
        {options.map((option: string, index: number) => {
          const showResult = !!answerResult;
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer =
            answerResult?.correct_answer?.answer === option;

          return (
            <Button
              key={index}
              variant="outline"
              className={`w-full h-auto py-4 px-6 text-left justify-start text-base transition-all ${
                showResult
                  ? isCorrectAnswer
                    ? "border-2 border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100"
                    : isSelected && !isCorrectAnswer
                    ? "border-2 border-red-500 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100"
                    : "opacity-40"
                  : isSelected
                  ? "border-2 border-primary bg-primary/10"
                  : ""
              }`}
              onClick={() => !answerResult && setSelectedAnswer(option)}
              disabled={!!answerResult}
            >
              <span className="flex-1">{option}</span>
              {showResult && isCorrectAnswer && (
                <CheckCircle className="w-5 h-5 text-green-500 ml-2 flex-shrink-0" />
              )}
              {showResult && isSelected && !isCorrectAnswer && (
                <AlertCircle className="w-5 h-5 text-red-500 ml-2 flex-shrink-0" />
              )}
            </Button>
          );
        })}
      </div>

      <SubmitButton
        onSubmit={handleSubmit}
        disabled={submitting || !selectedAnswer || !!answerResult}
        submitting={submitting}
      />

      <ResultDisplay answerResult={answerResult} question={question} />
    </div>
  );
}

export function MultipleSelectQuestion({
  question,
  onAnswerSubmit,
  currentAnswer,
  answerResult,
  submitting,
}: BaseQuestionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    currentAnswer?.answers || []
  );

  useEffect(() => {
    setSelectedAnswers(currentAnswer?.answers || []);
  }, [currentAnswer]);

  const handleToggle = (option: string) => {
    if (answerResult) return;

    setSelectedAnswers((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async () => {
    if (selectedAnswers.length > 0) {
      await onAnswerSubmit({ answers: selectedAnswers });
    }
  };

  const options = question.content?.options || [];
  const correctAnswers = answerResult?.correct_answer?.answers || [];

  return (
    <div className="space-y-6">
      <QuestionHeader question={question} />

      <p className="text-sm font-medium text-muted-foreground text-center">
        ⚠️ Chọn tất cả đáp án đúng
      </p>

      <div className="space-y-3">
        {options.map((option: string, index: number) => {
          const isSelected = selectedAnswers.includes(option);
          const isCorrect = correctAnswers.includes(option);
          const showResult = !!answerResult;

          return (
            <Card
              key={index}
              className={`p-4 cursor-pointer transition-all border-2 ${
                showResult
                  ? isCorrect
                    ? "border-green-500 bg-green-100 dark:bg-green-900/30"
                    : isSelected && !isCorrect
                    ? "border-red-500 bg-red-100 dark:bg-red-900/30"
                    : "opacity-50"
                  : isSelected && !showResult
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/30"
              }`}
              onClick={() => handleToggle(option)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  label=""
                  checked={isSelected}
                  disabled={!!answerResult}
                  className="pointer-events-none"
                />
                <span className="flex-1 font-medium">{option}</span>
                {showResult && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <SubmitButton
        onSubmit={handleSubmit}
        disabled={submitting || selectedAnswers.length === 0 || !!answerResult}
        submitting={submitting}
      />

      <ResultDisplay answerResult={answerResult} question={question} />
    </div>
  );
}

export function FillInTheBlankQuestion({
  question,
  onAnswerSubmit,
  currentAnswer,
  answerResult,
  submitting,
}: BaseQuestionProps) {
  const [answer, setAnswer] = useState<string>(currentAnswer?.answer || "");

  useEffect(() => {
    setAnswer(currentAnswer?.answer || "");
  }, [currentAnswer]);

  const handleSubmit = async () => {
    if (answer.trim()) {
      await onAnswerSubmit({ answer: answer.trim() });
    }
  };

  // Parse sentence with blanks: "I ___ a student" -> ["I ", "___", " a student"]
  const sentence = question.content?.sentence || "";
  const parts = sentence.split(/(_+)/g);

  return (
    <div className="space-y-6">
      <QuestionHeader question={question} />

      <Card className="p-6 bg-secondary/10">
        <div className="text-xl font-medium text-center flex flex-wrap items-center justify-center gap-2">
          {parts.map((part: string, index: number) => {
            if (part.match(/^_+$/)) {
              return (
                <Input
                  key={index}
                  value={answer}
                  onChange={(e) => !answerResult && setAnswer(e.target.value)}
                  disabled={!!answerResult}
                  placeholder="..."
                  className={`w-40 text-center font-bold text-lg inline-block ${
                    answerResult
                      ? answerResult.is_correct
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : ""
                  }`}
                />
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      </Card>

      <SubmitButton
        onSubmit={handleSubmit}
        disabled={submitting || !answer.trim() || !!answerResult}
        submitting={submitting}
      />

      <ResultDisplay answerResult={answerResult} question={question} />
    </div>
  );
}

export function MatchingQuestion({
  question,
  onAnswerSubmit,
  currentAnswer,
  answerResult,
  submitting,
}: BaseQuestionProps) {
  const leftItems = question.content?.left || [];
  const rightItems = question.content?.right || [];

  // matches: { "left_item": "right_item" }
  const [matches, setMatches] = useState<Record<string, string>>(
    currentAnswer?.matches || {}
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  useEffect(() => {
    setMatches(currentAnswer?.matches || {});
  }, [currentAnswer]);

  const handleLeftClick = (item: string) => {
    if (answerResult) return;
    setSelectedLeft(item);
  };

  const handleRightClick = (rightItem: string) => {
    if (answerResult || !selectedLeft) return;

    // Remove any existing match with this right item
    const newMatches = { ...matches };
    Object.keys(newMatches).forEach((key) => {
      if (newMatches[key] === rightItem) {
        delete newMatches[key];
      }
    });

    // Add new match
    newMatches[selectedLeft] = rightItem;
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const handleSubmit = async () => {
    if (Object.keys(matches).length === leftItems.length) {
      await onAnswerSubmit({ matches });
    }
  };

  const correctMatches = answerResult?.correct_answer?.matches || {};

  return (
    <div className="space-y-6">
      <QuestionHeader question={question} />

      <p className="text-sm font-medium text-muted-foreground text-center">
        💡 Chọn từ bên trái, sau đó chọn nghĩa tương ứng bên phải
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-3">
          <h3 className="font-bold text-center text-sm text-muted-foreground uppercase">
            Từ vựng
          </h3>
          {leftItems.map((item: string, index: number) => {
            const isSelected = selectedLeft === item;
            const isMatched = !!matches[item];
            const isCorrectMatch =
              answerResult && correctMatches[item] === matches[item];
            const isWrongMatch =
              answerResult &&
              matches[item] &&
              correctMatches[item] !== matches[item];

            return (
              <Card
                key={index}
                onClick={() => handleLeftClick(item)}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  isSelected
                    ? "border-primary bg-primary/10 scale-105"
                    : isMatched
                    ? answerResult
                      ? isCorrectMatch
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item}</span>
                  {isMatched && (
                    <span className="text-xs font-medium text-muted-foreground">
                      ↔ {matches[item]}
                    </span>
                  )}
                  {answerResult && isCorrectMatch && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {answerResult && isWrongMatch && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <h3 className="font-bold text-center text-sm text-muted-foreground uppercase">
            Nghĩa
          </h3>
          {rightItems.map((item: string, index: number) => {
            const isUsed = Object.values(matches).includes(item);

            return (
              <Card
                key={index}
                onClick={() => handleRightClick(item)}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedLeft
                    ? "border-primary/50 hover:border-primary hover:bg-primary/5"
                    : ""
                } ${isUsed ? "opacity-50" : ""}`}
              >
                <span className="font-medium">{item}</span>
              </Card>
            );
          })}
        </div>
      </div>

      <SubmitButton
        onSubmit={handleSubmit}
        disabled={
          submitting ||
          Object.keys(matches).length !== leftItems.length ||
          !!answerResult
        }
        submitting={submitting}
      />

      <ResultDisplay answerResult={answerResult} question={question} />
    </div>
  );
}

export function TranscriptQuestion({
  question,
  onAnswerSubmit,
  currentAnswer,
  answerResult,
  submitting,
}: BaseQuestionProps) {
  const [transcript, setTranscript] = useState<string>(
    currentAnswer?.transcript || ""
  );
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setTranscript(currentAnswer?.transcript || "");
  }, [currentAnswer]);

  const handlePlayAudio = () => {
    if (!question.audio_url) return;

    setIsPlaying(true);
    const audio = new Audio(question.audio_url);
    audio.play();
    audio.onended = () => setIsPlaying(false);
  };

  const handleSubmit = async () => {
    if (transcript.trim()) {
      await onAnswerSubmit({ transcript: transcript.trim() });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {question.content?.instruction ||
            "Nghe và viết lại những gì bạn nghe được"}
        </h2>
      </div>

      {/* Audio player */}
      <div className="flex justify-center">
        <Button
          size="lg"
          variant="outline"
          onClick={handlePlayAudio}
          disabled={!question.audio_url || isPlaying}
          className="h-20 w-20 rounded-full border-2"
        >
          {isPlaying ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Volume2 className="w-8 h-8" />
          )}
        </Button>
      </div>

      {/* Transcript input */}
      <div className="space-y-2">
        <textarea
          value={transcript}
          onChange={(e) => !answerResult && setTranscript(e.target.value)}
          disabled={!!answerResult}
          placeholder="Nhập những gì bạn nghe được..."
          className={`w-full min-h-[120px] p-4 rounded-lg border-2 font-medium resize-none ${
            answerResult
              ? answerResult.is_correct
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-border focus:border-primary"
          }`}
        />
      </div>

      <SubmitButton
        onSubmit={handleSubmit}
        disabled={submitting || !transcript.trim() || !!answerResult}
        submitting={submitting}
      />

      <ResultDisplay answerResult={answerResult} question={question} />
    </div>
  );
}

export function ArrangeWordsQuestion({
  question,
  onAnswerSubmit,
  currentAnswer,
  answerResult,
  submitting,
}: BaseQuestionProps) {
  const words = question.content?.words || [];
  const [arrangedWords, setArrangedWords] = useState<string[]>(
    currentAnswer?.arranged_words || []
  );
  const [availableWords, setAvailableWords] = useState<string[]>(
    words.filter((w: string) => !currentAnswer?.arranged_words?.includes(w))
  );

  useEffect(() => {
    if (currentAnswer?.arranged_words) {
      setArrangedWords(currentAnswer.arranged_words);
      setAvailableWords(
        words.filter((w: string) => !currentAnswer.arranged_words.includes(w))
      );
    }
  }, [currentAnswer]);

  const handleWordClick = (word: string, fromArranged: boolean) => {
    if (answerResult) return;

    if (fromArranged) {
      // Remove from arranged, add back to available
      setArrangedWords((prev) => prev.filter((w) => w !== word));
      setAvailableWords((prev) => [...prev, word]);
    } else {
      // Add to arranged, remove from available
      setArrangedWords((prev) => [...prev, word]);
      setAvailableWords((prev) => prev.filter((w) => w !== word));
    }
  };

  const handleSubmit = async () => {
    if (arrangedWords.length === words.length) {
      await onAnswerSubmit({ arranged_words: arrangedWords });
    }
  };

  return (
    <div className="space-y-6">
      <QuestionHeader question={question} />

      <p className="text-sm font-medium text-muted-foreground text-center">
        📝 Sắp xếp các từ thành câu hoàn chỉnh
      </p>

      {/* Arranged sentence area */}
      <Card
        className={`p-6 min-h-[100px] ${
          answerResult
            ? answerResult.is_correct
              ? "bg-green-50 border-green-500 dark:bg-green-900/20"
              : "bg-red-50 border-red-500 dark:bg-red-900/20"
            : "bg-secondary/10"
        }`}
      >
        <div className="flex flex-wrap gap-2 justify-center items-center min-h-[60px]">
          {arrangedWords.length === 0 ? (
            <span className="text-muted-foreground italic">
              Nhấn vào các từ bên dưới để sắp xếp...
            </span>
          ) : (
            arrangedWords.map((word, index) => (
              <Button
                key={index}
                variant="default"
                size="lg"
                onClick={() => handleWordClick(word, true)}
                disabled={!!answerResult}
                className="font-medium"
              >
                {word}
              </Button>
            ))
          )}
        </div>
      </Card>

      {/* Available words */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground text-center uppercase">
          Các từ có sẵn
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {availableWords.map((word, index) => (
            <Button
              key={index}
              variant="outline"
              size="lg"
              onClick={() => handleWordClick(word, false)}
              disabled={!!answerResult}
              className="font-medium"
            >
              {word}
            </Button>
          ))}
        </div>
      </div>

      <SubmitButton
        onSubmit={handleSubmit}
        disabled={
          submitting || arrangedWords.length !== words.length || !!answerResult
        }
        submitting={submitting}
      />

      <ResultDisplay answerResult={answerResult} question={question} />
    </div>
  );
}

export function TrueFalseQuestion({
  question,
  onAnswerSubmit,
  currentAnswer,
  answerResult,
  submitting,
}: BaseQuestionProps) {
  const [value, setValue] = useState<boolean | null>(
    currentAnswer?.answer ?? null
  );

  const handleSubmit = async () => {
    if (value !== null) {
      await onAnswerSubmit({ answer: value });
    }
  };

  return (
    <div className="space-y-6">
      <QuestionHeader question={question} />

      <div className="flex gap-4 justify-center">
        {[true, false].map((v) => {
          const isSelected = value === v;
          const isCorrect = answerResult?.correct_answer?.answer === v;

          return (
            <Button
              key={String(v)}
              variant="outline"
              disabled={!!answerResult}
              onClick={() => setValue(v)}
              className={`px-8 ${
                answerResult
                  ? isCorrect
                    ? "border-green-500 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : isSelected
                    ? "border-red-500 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "opacity-50"
                  : isSelected
                  ? "border-primary bg-primary/10"
                  : ""
              }`}
            >
              {v ? "Đúng" : "Sai"}
            </Button>
          );
        })}
      </div>

      <SubmitButton
        onSubmit={handleSubmit}
        disabled={submitting || value === null || !!answerResult}
        submitting={submitting}
      />

      <ResultDisplay answerResult={answerResult} question={question} />
    </div>
  );
}

function QuestionHeader({ question }: { question: QuestionInfo }) {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
        {question.content?.question || question.content?.text || "Câu hỏi"}
      </h2>

      {question.audio_url && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            const audio = new Audio(question.audio_url!);
            audio.play();
          }}
        >
          <Volume2 className="w-5 h-5 mr-2" />
          Nghe
        </Button>
      )}
    </div>
  );
}

function SubmitButton({
  onSubmit,
  disabled,
  submitting,
}: {
  onSubmit: () => void;
  disabled: boolean;
  submitting: boolean;
}) {
  return (
    <Button onClick={onSubmit} disabled={disabled} className="w-full" size="lg">
      {submitting ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Đang kiểm tra...
        </>
      ) : (
        "Kiểm tra"
      )}
    </Button>
  );
}

function ResultDisplay({
  answerResult,
  question,
}: {
  answerResult?: QuestionAnswerSubmitResponse;
  question: QuestionInfo;
}) {
  if (!answerResult) return null;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        answerResult.is_correct
          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
          : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {answerResult.is_correct ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-600">Chính xác!</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-bold text-red-600">Chưa đúng</span>
          </>
        )}
      </div>

      {!answerResult.is_correct && answerResult.correct_answer && (
        <div className="text-sm text-muted-foreground mb-2">
          <span className="font-bold">Đáp án đúng: </span>
          <span>
            {formatCorrectAnswer(answerResult.correct_answer, question.type)}
          </span>
        </div>
      )}

      {question.explanation && (
        <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border">
          💡 {question.explanation}
        </p>
      )}
    </div>
  );
}

function formatCorrectAnswer(correctAnswer: any, questionType: string): string {
  if (questionType === "MULTIPLE_SELECT") {
    return correctAnswer.answers?.join(", ") || "";
  }
  if (questionType === "MATCHING") {
    return Object.entries(correctAnswer.matches || {})
      .map(([key, value]) => `${key} → ${value}`)
      .join(", ");
  }
  if (questionType === "ORDERING") {
    return correctAnswer.arranged_words?.join(" ") || "";
  }
  if (questionType === "TRUE_FALSE") {
    return correctAnswer.answer ? "Đúng" : "Sai";
  }
  return correctAnswer.answer || correctAnswer.transcript || "";
}

export function QuestionRenderer(props: BaseQuestionProps) {
  const { question } = props;

  switch (question.type) {
    case "MCQ":
      return <MultipleChoiceQuestion {...props} />;
    case "MULTIPLE_SELECT":
      return <MultipleSelectQuestion {...props} />;
    case "FILL_IN_THE_BLANK":
      return <FillInTheBlankQuestion {...props} />;
    case "MATCHING":
      return <MatchingQuestion {...props} />;
    case "TRANSCRIPT":
      return <TranscriptQuestion {...props} />;
    case "ORDERING":
      return <ArrangeWordsQuestion {...props} />;
    case "TRUE_FALSE":
      return <TrueFalseQuestion {...props} />;
    default:
      return (
        <div className="text-center text-muted-foreground">
          Loại câu hỏi không được hỗ trợ: {question.type}
        </div>
      );
  }
}
