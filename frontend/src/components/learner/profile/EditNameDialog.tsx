import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";

interface EditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  onSave: (e: React.FormEvent) => void;
}

export default function EditNameDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  onSave,
}: EditNameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-border">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tên</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4 pt-2">
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
            className="border-2"
          />
          <Button type="submit" className="w-full font-bold shadow-sm">
            Lưu
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
