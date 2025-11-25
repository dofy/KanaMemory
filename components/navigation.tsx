"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Monitor, Github, Settings, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavigationProps {
  title?: string;
  showBackButton?: boolean;
  onSettingsClick?: () => void;
}

export function Navigation({
  title = "日语学习工具",
  showBackButton = false,
  onSettingsClick,
}: NavigationProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPageTitle = () => {
    if (title !== "日语学习工具") return title;

    if (pathname === "/kana") return "假名学习";
    if (pathname === "/words") return "单词学习";
    if (pathname === "/phrases") return "句子学习";
    return title;
  };

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-5 w-5" />;
    if (theme === "light") return <Sun className="h-5 w-5" />;
    if (theme === "dark") return <Moon className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const getThemeLabel = () => {
    if (!mounted) return "系统";
    if (theme === "light") return "亮色";
    if (theme === "dark") return "暗色";
    return "系统";
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/images/favicon.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded"
            />
            <h1 className="text-xl font-bold">{getPageTitle()}</h1>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {onSettingsClick && (
            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
              <Settings className="h-5 w-5" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="主题设置">
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
                <span>跟随系统</span>
                {theme === "system" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}

