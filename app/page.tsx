"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, MessageSquare, Github, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const learningModes = [
    {
      title: "假名学习",
      description: "学习和记忆日语假名（平假名、片假名）",
      icon: BookOpen,
      href: "/kana",
      color: "text-blue-500",
    },
    {
      title: "单词学习",
      description: "按假名行分类学习日语单词",
      icon: Brain,
      href: "/words",
      color: "text-green-500",
    },
    {
      title: "句子学习",
      description: "学习常用日语句子（开发中）",
      icon: MessageSquare,
      href: "/phrases",
      color: "text-purple-500",
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/favicon.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded"
            />
            <h1 className="text-xl font-bold">日语学习工具</h1>
          </div>

          <div className="flex items-center gap-4">
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
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">选择学习模式</h2>
          <p className="text-muted-foreground text-lg">
            从假名学习开始，逐步掌握日语单词和常用句子
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {learningModes.map((mode) => {
            const Icon = mode.icon;
            const CardComponent = (
              <Card
                className={`transition-all hover:shadow-lg ${
                  mode.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:scale-105"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-8 w-8 ${mode.color}`} />
                    <CardTitle>{mode.title}</CardTitle>
                  </div>
                  <CardDescription>{mode.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    disabled={mode.disabled}
                    variant={mode.disabled ? "outline" : "default"}
                  >
                    {mode.disabled ? "开发中" : "开始学习"}
                  </Button>
                </CardContent>
              </Card>
            );

            if (mode.disabled) {
              return <div key={mode.title}>{CardComponent}</div>;
            }

            return (
              <Link key={mode.title} href={mode.href}>
                {CardComponent}
              </Link>
            );
          })}
        </div>

        <div className="mt-16 text-center text-muted-foreground">
          <p className="mb-2">功能特点</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span>✓ 多种学习模式</span>
            <span>✓ 语音朗读</span>
            <span>✓ 快捷键支持</span>
            <span>✓ 深色模式</span>
            <span>✓ 本地存储进度</span>
          </div>
        </div>
      </main>
    </div>
  );
}
