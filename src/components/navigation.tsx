import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { HeaderActions } from "@/components/header-actions";

interface NavigationProps {
  title?: string;
  showBackButton?: boolean;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
}

export function Navigation({
  title = "日语学习工具",
  showBackButton = false,
  onSettingsClick,
  onHelpClick,
}: NavigationProps) {
  const location = useLocation();

  const getPageTitle = () => {
    if (title !== "日语学习工具") return title;

    if (location.pathname === "/kana") return "假名學習";
    if (location.pathname === "/words") return "單詞學習";
    if (location.pathname === "/phrases") return "句子學習";
    return title;
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/favicon.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded"
            />
            <h1 className="text-xl font-bold">{getPageTitle()}</h1>
          </Link>
        </div>

        <HeaderActions
          onHelpClick={onHelpClick}
          onSettingsClick={onSettingsClick}
          hideGithubOnMobile
        />
      </div>
    </header>
  );
}
