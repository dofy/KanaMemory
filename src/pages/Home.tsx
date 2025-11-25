import { useTheme } from "@/components/theme-provider-custom";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookText,
  Github,
  Languages,
  MessageCircle,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-5 w-5" />;
    if (theme === "light") return <Sun className="h-5 w-5" />;
    if (theme === "dark") return <Moon className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

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
            <h1 className="text-xl font-bold">日語學習工具</h1>
          </div>

          <div className="flex items-center gap-4">
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
              href="https://github.com/dofy/KanaSyllabaryMemory"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
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
    </div>
  );
}
