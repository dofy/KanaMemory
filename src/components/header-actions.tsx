import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider-custom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Github,
  HelpCircle,
  Monitor,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderActionsProps {
  onHelpClick?: () => void;
  onSettingsClick?: () => void;
  hideGithubOnMobile?: boolean;
  className?: string;
}

export function HeaderActions({
  onHelpClick,
  onSettingsClick,
  hideGithubOnMobile = false,
  className,
}: HeaderActionsProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-5 w-5" />;
    if (theme === "light") return <Sun className="h-5 w-5" />;
    if (theme === "dark") return <Moon className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {onHelpClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onHelpClick}
          title="幫助 / 快捷鍵 (?)"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      )}

      {onSettingsClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          title="設置"
        >
          <Settings className="h-5 w-5" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="主題設置">
            {getThemeIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            <span>亮色</span>
            {theme === "light" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            <span>暗色</span>
            {theme === "dark" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Monitor className="mr-2 h-4 w-4" />
            <span>跟隨系統</span>
            {theme === "system" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <a
        href="https://github.com/dofy/KanaSyllabaryMemory"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          hideGithubOnMobile ? "hidden sm:block" : "",
          "transition-colors"
        )}
        title="GitHub"
      >
        <Button variant="ghost" size="icon">
          <Github className="h-5 w-5" />
        </Button>
      </a>
    </div>
  );
}
