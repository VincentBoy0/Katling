import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LessonContentResponse } from "@/types/lesson";
import {
  Book,
  BookOpen,
  FileText,
  Headphones,
  Loader2,
  MessageSquare,
  Mic,
  Play,
  Star,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LessonContentModalProps {
  content: LessonContentResponse | null;
  loading: boolean;
  onClose: () => void;
  onStartLesson: () => void;
  onViewSections: () => void;
}

const getLessonTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    READING: FileText,
    LISTENING: Headphones,
    SPEAKING: Mic,
    WRITING: MessageSquare,
    VOCABULARY: Book,
    GRAMMAR: Zap,
    TEST: Star,
  };
  return icons[type] || BookOpen;
};

const getLessonTypeGradient = (type: string) => {
  const gradients: Record<string, string> = {
    READING: "from-blue-500 to-blue-600",
    LISTENING: "from-purple-500 to-purple-600",
    SPEAKING: "from-orange-500 to-orange-600",
    WRITING: "from-green-500 to-green-600",
    VOCABULARY: "from-pink-500 to-pink-600",
    GRAMMAR: "from-yellow-500 to-yellow-600",
    TEST: "from-red-500 to-red-600",
  };
  return gradients[type] || "from-primary to-primary/80";
};

export default function LessonContentModal({
  content,
  loading,
  onClose,
  onStartLesson,
  onViewSections,
}: LessonContentModalProps) {
  if (!content && !loading) return null;

  const LessonIcon = content ? getLessonTypeIcon(content.type) : BookOpen;
  const gradient = content
    ? getLessonTypeGradient(content.type)
    : "from-primary to-primary/80";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>

          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-lg font-medium">Đang tải...</span>
            </div>
          ) : (
            content && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <LessonIcon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {content.type}
                  </span>
                  <h2 className="text-2xl font-bold mt-1">{content.title}</h2>
                </div>
              </div>
            )
          )}
        </div>

        {/* Content */}
        {!loading && content && (
          <div className="overflow-y-auto max-h-[50vh]">
            {/* Audio Player */}
            {content.audio_url && (
              <div className="p-4 bg-muted/30 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Volume2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">
                      Nghe audio bài học
                    </p>
                    <audio
                      controls
                      className="w-full h-8"
                      src={content.audio_url}
                    >
                      Trình duyệt không hỗ trợ audio.
                    </audio>
                  </div>
                </div>
              </div>
            )}

            {/* Image */}
            {content.image_url && (
              <div className="p-4 border-b">
                <img
                  src={content.image_url}
                  alt={content.title}
                  className="w-full h-auto max-h-64 object-contain rounded-lg"
                />
              </div>
            )}

            {/* Text Content */}
            {content.content && (
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg bg-gradient-to-r ${gradient}`}
                  >
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  Nội dung bài học
                </h3>
                <div className="prose prose-base dark:prose-invert max-w-none prose-headings:text-foreground prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-foreground prose-strong:font-bold prose-em:text-foreground/90 prose-em:italic prose-ul:my-4 prose-ul:space-y-2 prose-ol:my-4 prose-ol:space-y-2 prose-li:text-foreground prose-li:leading-relaxed prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                  {typeof content.content === "string" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content.content}
                    </ReactMarkdown>
                  ) : content.content?.markdown ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content.content.markdown}
                    </ReactMarkdown>
                  ) : content.content?.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content.content.content}
                    </ReactMarkdown>
                  ) : content.content?.text ? (
                    <p className="text-foreground whitespace-pre-wrap">
                      {content.content.text}
                    </p>
                  ) : content.content?.html ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: content.content.html }}
                      className="text-foreground"
                    />
                  ) : (
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(content.content, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* No content message */}
            {!content.content && !content.audio_url && !content.image_url && (
              <div className="p-12 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">
                  Bài học này chưa có nội dung xem trước.
                </p>
                <p className="text-sm mt-1">Hãy bắt đầu học để khám phá!</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {!loading && content && (
          <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onViewSections}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Xem danh sách phần học
            </Button>
            <Button className="flex-1" onClick={onStartLesson}>
              <Play className="w-4 h-4 mr-2 fill-current" />
              Bắt đầu làm bài
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
