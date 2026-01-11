import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Xác nhận xóa bài viết
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không
            thể hoàn tác.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="font-bold bg-red-500 text-white hover:bg-red-600"
          >
            Xóa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
