import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import { Textarea } from "@/components/learner/textarea";
import { Button } from "@/components/ui/button";

interface Post {
  id: number;
  title: string;
  content: string;
}

interface EditPostDialogProps {
  open: boolean;
  post: Post | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, title: string, content: string) => void;
}

export function EditPostDialog({
  open,
  post,
  onOpenChange,
  onSubmit,
}: EditPostDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    onSubmit(post.id, title, content);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Chỉnh sửa bài viết
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border-2"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={5}
            className="border-2 resize-none"
          />
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 font-bold shadow-sm bg-primary text-white"
            >
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
