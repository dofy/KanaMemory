import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { BadgeDefinition } from "@/lib/db-types";
import confetti from "canvas-confetti";

interface BadgeUnlockDialogProps {
  badge: BadgeDefinition | null;
  open: boolean;
  onClose: () => void;
}

export function BadgeUnlockDialog({
  badge,
  open,
  onClose,
}: BadgeUnlockDialogProps) {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open && badge) {
      // Trigger confetti animation
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ["#FFD700", "#FFA500", "#FF6347"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ["#FFD700", "#FFA500", "#FF6347"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Show content with delay for animation
      setTimeout(() => setShowContent(true), 200);
    } else {
      setShowContent(false);
    }
  }, [open, badge]);

  if (!badge) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            🎉 恭喜获得新勋章！
          </DialogTitle>
        </DialogHeader>

        <div
          className={`transition-all duration-500 ${
            showContent
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-4"
          }`}
        >
          {/* Badge Icon */}
          <div className="flex justify-center my-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse shadow-lg shadow-yellow-500/50">
                <span className="text-5xl">{badge.icon}</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                ✨
              </div>
            </div>
          </div>

          {/* Badge Info */}
          <h3 className="text-2xl font-bold mb-2">{badge.name}</h3>
          <p className="text-muted-foreground mb-6">{badge.description}</p>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClose}>
              继续学习
            </Button>
            <Button
              onClick={() => {
                onClose();
                navigate("/badges");
              }}
            >
              查看所有勋章
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

