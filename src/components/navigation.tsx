import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { HeaderActions } from "@/components/header-actions";

interface NavigationProps {
  title?: string;
  customTitle?: string;
  showBackButton?: boolean;
  backPath?: string;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
}

export function Navigation({
  title = "日語學習工具",
  customTitle,
  showBackButton = false,
  backPath = "/",
  onSettingsClick,
  onHelpClick,
}: NavigationProps) {
  const location = useLocation();

  const getPageTitle = () => {
    if (customTitle) return customTitle;
    if (title !== "日語學習工具") return title;

    if (location.pathname === "/kana") return "假名學習";
    if (location.pathname === "/words") return "單詞學習";
    if (location.pathname === "/phrases") return "句子學習";
    if (location.pathname === "/study-plans") return "學習方案";
    if (location.pathname === "/badges") return "成就勳章";
    if (location.pathname.includes("/study-plans/") && location.pathname.includes("/learn")) {
      return "方案學習";
    }
    return title;
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Link to={backPath}>
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
