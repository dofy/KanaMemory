import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookText, Languages, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HelpDialog } from "@/components/help-dialog";
import {
  STANDARD_SHORTCUTS,
  useKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";
import { HeaderActions } from "@/components/header-actions";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useKeyboardShortcuts({
    onGoHome: () => navigate("/"),
    onGoKana: () => navigate("/kana"),
    onGoWords: () => navigate("/words"),
    onGoPhrases: () => navigate("/phrases"),
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
    isHelpOpen,
    enabled: mounted,
  });

  if (!mounted) {
    return null;
  }

  const learningModes = [
    {
      title: "假名學習",
      description: "學習和記憶日語假名",
      icon: Languages,
      href: "/kana",
      color: "text-blue-500",
    },
    {
      title: "單詞學習",
      description: "按假名行分類學習日語單詞",
      icon: BookText,
      href: "/words",
      color: "text-green-500",
    },
    {
      title: "句子學習",
      description: "學習常用日語句子",
      icon: MessageCircle,
      href: "/phrases",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/images/favicon.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded"
            />
            <h1 className="text-xl font-bold">Kana Memory</h1>
          </div>

          <HeaderActions onHelpClick={() => setIsHelpOpen(true)} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">選擇學習模式</h2>
          <p className="text-muted-foreground text-lg">
            從假名學習開始，逐步掌握日語單詞和常用句子
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {learningModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link key={mode.title} to={mode.href}>
                <Card
                  className={`transition-all hover:shadow-lg cursor-pointer hover:scale-105`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-8 w-8 ${mode.color}`} />
                      <CardTitle>{mode.title}</CardTitle>
                    </div>
                    <CardDescription>{mode.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">開始學習</Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 text-center text-muted-foreground">
          <p className="mb-2">功能特点</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span>✓ 多種學習模式</span>
            <span>✓ 语音朗读</span>
            <span>✓ 快捷键支持</span>
            <span>✓ 深色模式</span>
            <span>✓ 本地存储进度</span>
          </div>
        </div>
      </main>

      <Footer />

      <HelpDialog
        open={isHelpOpen}
        onOpenChange={setIsHelpOpen}
        shortcuts={STANDARD_SHORTCUTS}
      />
    </div>
  );
}
