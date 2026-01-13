import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import { Textarea } from "@/components/learner/textarea";
import { Button } from "@/components/ui/button";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string) => Promise<void>;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreatePostDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(title, content);
      // Clear form only on success
      setTitle("");
      setContent("");
    } catch (err) {
      // Error is handled in parent component
      console.error("Dialog submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-2 border-border max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Tạo bài viết mới
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Tiêu đề..."
              className="border-2"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              placeholder="Nội dung..."
              className="border-2 resize-none min-h-[300px]"
            />
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 font-bold"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 font-bold shadow-sm"
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting ? "Đang đăng..." : "Đăng bài"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
