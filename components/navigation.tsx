"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun, Github, Settings, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  const getPageTitle = () => {
    if (title !== "日语学习工具") return title;

    if (pathname === "/kana") return "假名学习";
    if (pathname === "/words") return "单词学习";
    if (pathname === "/phrases") return "句子学习";
    return title;
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

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

