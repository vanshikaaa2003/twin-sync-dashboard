import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteConfirm({ onConfirm }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="text-destructive">
          <Trash2 size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Delete twin?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>

        <DialogFooter>
          <Button variant="secondary" asChild>
            <DialogTrigger>Cancel</DialogTrigger>
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
