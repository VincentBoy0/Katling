import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/learner/dialog";
import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { useUserInfoContext } from "@/context/user-info-context";
import { toast } from "sonner";

interface EditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditNameDialog({
  open,
  onOpenChange,
}: EditNameDialogProps) {
  const { userInfo, loading, updateUserInfo } = useUserInfoContext();
  const [name, setName] = useState("");

  useEffect(() => {
    if (userInfo?.full_name) {
      setName(userInfo.full_name);
    }
  }, [userInfo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserInfo({ full_name: name });
      toast.success("Đã cập nhật tên thành công");
      onOpenChange(false);
    } catch (error) {
      toast.error("Không thể cập nhật tên", {
        description: "Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-border">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tên</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border-2"
            disabled={loading}
          />
          <Button
            type="submit"
            className="w-full font-bold shadow-sm"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
