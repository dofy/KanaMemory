import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: Array<{ key: string; description: string }>;
}

export function HelpDialog({ open, onOpenChange, shortcuts }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="sm:max-w-md max-h-[70vh] sm:max-h-none overflow-auto"
      >
        <div className="sticky top-0 z-20 bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b">
          <DialogHeader className="px-3 py-2 flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl">鍵盤快捷鍵</DialogTitle>
            <DialogClose className="ml-2">
              <span className="sr-only">關閉</span>
            </DialogClose>
          </DialogHeader>
        </div>
        <div className="space-y-2 sm:space-y-3 px-1 pt-2">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/50"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-background px-2 font-mono text-xs font-medium text-foreground">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
