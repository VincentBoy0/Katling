import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import { Textarea } from "@/components/learner/textarea";
import { Button } from "@/components/ui/button";
import { ReportCategory, ReportSeverity } from "@/types/report";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    severity: ReportSeverity;
    category: ReportCategory;
  }) => void;
  postId?: number | null;
  fixedCategory?: ReportCategory;
}

export function ReportDialog({
  open,
  onOpenChange,
  onSubmit,
  postId,
  fixedCategory,
}: ReportDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<ReportSeverity>(
    ReportSeverity.MEDIUM
  );
  const [category, setCategory] = useState<ReportCategory>(
    fixedCategory || ReportCategory.POST
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ title, description, severity, category });
      setTitle("");
      setDescription("");
      setSeverity(ReportSeverity.MEDIUM);
      if (!fixedCategory) {
        setCategory(ReportCategory.POST);
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Báo cáo</DialogTitle>
          <DialogDescription>
            Vui lòng mô tả chi tiết vấn đề bạn gặp phải
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề..."
            required
            className="border-2"
          />

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            placeholder="Mô tả chi tiết..."
            className="border-2 resize-none"
          />

          {/* Severity */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              Mức độ nghiêm trọng
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
              className="mt-1 w-full h-11 border-2 border-border rounded-md px-3 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={ReportSeverity.LOW}>Low</option>
              <option value={ReportSeverity.MEDIUM}>Medium</option>
              <option value={ReportSeverity.HIGH}>High</option>
              <option value={ReportSeverity.CRITICAL}>Critical</option>
            </select>
          </div>

          {/* Category */}
          {!fixedCategory && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Phân loại lỗi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="mt-1 w-full h-11 border-2 border-border rounded-md px-3 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={ReportCategory.BUG}>Bug</option>
                <option value={ReportCategory.FEATURE_REQUEST}>
                  Feature Request
                </option>
                <option value={ReportCategory.CONTENT_ERROR}>
                  Content Error
                </option>
                <option value={ReportCategory.PERFORMANCE}>Performance</option>
                <option value={ReportCategory.ACCESSIBILITY}>
                  Accessibility
                </option>
                {/* <option value={ReportCategory.POST}>Post</option> */}
                <option value={ReportCategory.OTHER}>Other</option>
              </select>
            </div>
          )}

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
              disabled={isSubmitting || !title.trim() || !description.trim()}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
